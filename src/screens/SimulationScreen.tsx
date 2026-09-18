import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Dimensions, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WEATHER } from '../data/constants';
import { useGameStore } from '../store/gameStore';
import { StatPill } from '../components/StatPill';
import { StandRig } from '../components/StandRig';
import { SceneBackground } from '../components/simulation/SceneBackground';
import { PersonSprite } from '../components/simulation/PersonSprite';
import { laneBottom, laneScale } from '../components/simulation/geometry';
import { DayResult } from '../types';
import { formatMoney } from '../utils/money';
import { Icon, IconName } from '../components/icons/Icon';
import { adsStatus, adsSupported, isRewardedReady, maybeShowInterstitial, showRewarded } from '../ads/ads';
import { FONT } from '../theme/type';

const { width: SCREEN_WIDTH, height: SCREEN_H } = Dimensions.get('window');
const FALLBACK_SCENE_HEIGHT = Math.round(SCREEN_H * 0.5);

const MAX_CUSTOMERS_SHOWN = 12;
const STAGGER_MS = 460;
const WALK_DURATION_MS = 3200;
const ARRIVE_FRAC = 0.42;
const HOLD_END_FRAC = 0.62;

const PERSON_BASE = 44;
const CART_SCALE = 0.78;
const CART_LANE = 0.5;
const CUSTOMER_LANES = [0.62, 0.78, 0.94];
const AMBIENT_LANES = [0.16, 0.26, 0.34];

const COUNTER_X = 128;
const QUEUE_GAP = 30;
const ENTRY_X = SCREEN_WIDTH + 60;
const EXIT_LEFT_X = -70;
const EXIT_RIGHT_X = SCREEN_WIDTH + 70;

type CustomerType = 'satisfied' | 'unsatisfied' | 'price' | 'stockout';

interface CustomerSpec {
  id: number;
  type: CustomerType;
  phraseIndex: number;
  lane: number;
  slot: number;
  // How many real customers this on-screen sprite stands for, so the live
  // counters add up to the day's real totals.
  weight: number;
}

function distribute(total: number, parts: number): number[] {
  if (parts <= 0) return [];
  const base = Math.floor(total / parts);
  const remainder = total - base * parts;
  return Array.from({ length: parts }, (_, i) => base + (i < remainder ? 1 : 0));
}

const TYPE_COLORS: Record<CustomerType, string> = {
  satisfied: '#E3F6E5',
  unsatisfied: '#FFF3D6',
  price: '#FDE8E8',
  stockout: '#EAEAEA',
};

function stopXFor(type: CustomerType, slot: number): number {
  const queued = COUNTER_X + slot * QUEUE_GAP;
  return type === 'price' ? queued + SCREEN_WIDTH * 0.26 : queued;
}

function pathFor(type: CustomerType, slot: number): number[] {
  const stop = stopXFor(type, slot);
  const exit = type === 'satisfied' || type === 'unsatisfied' ? EXIT_LEFT_X : EXIT_RIGHT_X;
  return [ENTRY_X, stop, stop, exit];
}

function turnsAround(type: CustomerType): boolean {
  return type === 'price' || type === 'stockout';
}

// Build a shown sample of customers proportional to real counts, guaranteeing
// every category that actually occurred gets at least one visible customer.
function sampleCustomers(counts: Record<CustomerType, number>, maxShown: number): CustomerSpec[] {
  const types = Object.keys(counts) as CustomerType[];
  const total = types.reduce((sum, k) => sum + counts[k], 0);
  if (total <= 0) return [];

  const shown = Math.min(maxShown, total);
  const allocation: Record<CustomerType, number> = { satisfied: 0, unsatisfied: 0, price: 0, stockout: 0 };
  let remaining = shown;

  types.forEach((type) => {
    if (counts[type] > 0 && remaining > 0) {
      allocation[type] = 1;
      remaining -= 1;
    }
  });

  const proportional = types.map((type) => ({ type, weight: counts[type] / total }));
  proportional.sort((a, b) => b.weight - a.weight);
  let i = 0;
  while (remaining > 0) {
    const type = proportional[i % proportional.length].type;
    if (counts[type] > allocation[type]) {
      allocation[type] += 1;
      remaining -= 1;
    }
    i += 1;
    if (i > 1000) break;
  }

  const flat: CustomerType[] = [];
  types.forEach((type) => {
    for (let n = 0; n < allocation[type]; n++) flat.push(type);
  });
  flat.sort(() => Math.random() - 0.5);

  const weights: Record<CustomerType, number[]> = {
    satisfied: distribute(counts.satisfied, allocation.satisfied),
    unsatisfied: distribute(counts.unsatisfied, allocation.unsatisfied),
    price: distribute(counts.price, allocation.price),
    stockout: distribute(counts.stockout, allocation.stockout),
  };

  const perType: Record<CustomerType, number> = { satisfied: 0, unsatisfied: 0, price: 0, stockout: 0 };
  return flat.map((type, index) => {
    const phraseIndex = perType[type]++;
    return {
      id: index,
      type,
      phraseIndex,
      lane: CUSTOMER_LANES[index % CUSTOMER_LANES.length],
      slot: Math.floor(index / CUSTOMER_LANES.length) % 3,
      weight: weights[type][phraseIndex] ?? 1,
    };
  });
}

export default function SimulationScreen({ navigation }: any) {
  const { t, i18n } = useTranslation();
  const [result] = useState<DayResult>(() => useGameStore.getState().computeDayPreview());
  const [done, setDone] = useState(false);
  const [soldSoFar, setSoldSoFar] = useState(0);
  const [satisfiedSoFar, setSatisfiedSoFar] = useState(0);
  const [priceSoFar, setPriceSoFar] = useState(0);
  const [stockoutSoFar, setStockoutSoFar] = useState(0);
  const [dislikedSoFar, setDislikedSoFar] = useState(0);
  const [revenueSoFar, setRevenueSoFar] = useState(0);
  const [sceneHeight, setSceneHeight] = useState(FALLBACK_SCENE_HEIGHT);
  const [coinPops, setCoinPops] = useState<{ key: number; label: string; left: number; bottom: number }[]>([]);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const [watchingAd, setWatchingAd] = useState(false);
  const [rewardReady, setRewardReady] = useState(false);

  const weather = WEATHER[result.weather];
  const currentDay = useGameStore((s) => s.day);
  const locationId = useGameStore((s) => s.currentLocationId);
  const price = useGameStore((s) => s.price);
  const cash = useGameStore((s) => s.cash);
  const inventory = useGameStore((s) => s.inventory);

  const phrasesByType: Record<CustomerType, string[]> = {
    satisfied: t('simulation.happyPhrases', { returnObjects: true }) as string[],
    unsatisfied: t('simulation.mehPhrases', { returnObjects: true }) as string[],
    price: t('simulation.pricePhrases', { returnObjects: true }) as string[],
    stockout: t('simulation.stockoutPhrases', { returnObjects: true }) as string[],
  };

  const customers = useMemo<CustomerSpec[]>(
    () =>
      sampleCustomers(
        {
          satisfied: result.unitsSatisfied,
          unsatisfied: result.unitsUnsatisfied,
          price: result.customersDeclinedPrice,
          stockout: result.customersLostStock,
        },
        MAX_CUSTOMERS_SHOWN
      ),
    [result]
  );

  const revenuePerUnit = result.unitsSold > 0 ? result.revenue / result.unitsSold : 0;

  const progressValues = useMemo(() => customers.map(() => new Animated.Value(0)), [customers]);
  const dayClock = useRef(new Animated.Value(0)).current;
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const sceneHeightRef = useRef(sceneHeight);
  sceneHeightRef.current = sceneHeight;

  const totalDuration = customers.length * STAGGER_MS + WALK_DURATION_MS;

  useEffect(() => {
    Animated.timing(dayClock, {
      toValue: 1,
      duration: Math.max(1200, totalDuration),
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [dayClock, totalDuration]);

  useEffect(() => {
    if (customers.length === 0) {
      setDone(true);
      return;
    }
    const animations = progressValues.map((value, i) =>
      Animated.timing(value, {
        toValue: 1,
        duration: WALK_DURATION_MS,
        delay: i * STAGGER_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    customers.forEach((customer, i) => {
      const arrivalTime = i * STAGGER_MS + WALK_DURATION_MS * ARRIVE_FRAC;
      const timeoutId = setTimeout(() => {
        const w = customer.weight;
        if (customer.type === 'satisfied' || customer.type === 'unsatisfied') {
          setSoldSoFar((n) => n + w);
          setRevenueSoFar((n) => n + w * revenuePerUnit);
          if (customer.type === 'satisfied') setSatisfiedSoFar((n) => n + w);
          else setDislikedSoFar((n) => n + w);
          setCoinPops((pops) => [
            ...pops,
            {
              key: customer.id,
              label: `+${formatMoney(w * revenuePerUnit, i18n.language)}`,
              left: stopXFor(customer.type, customer.slot),
              bottom: laneBottom(sceneHeightRef.current, customer.lane) + 74,
            },
          ]);
        } else if (customer.type === 'price') {
          setPriceSoFar((n) => n + w);
        } else {
          setStockoutSoFar((n) => n + w);
        }
      }, arrivalTime);
      timeouts.current.push(timeoutId);
    });

    Animated.parallel(animations).start(() => setDone(true));

    return () => {
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];
    };
  }, [customers, progressValues, revenuePerUnit]);

  // An ad may finish loading after the results card appears, so poll briefly.
  useEffect(() => {
    if (!done || !adsSupported) return;
    setRewardReady(isRewardedReady());
    const id = setInterval(() => setRewardReady(isRewardedReady()), 1000);
    const stop = setTimeout(() => clearInterval(id), 6000);
    return () => {
      clearInterval(id);
      clearTimeout(stop);
    };
  }, [done]);

  const handleSkip = () => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    setSoldSoFar(result.unitsSold);
    setSatisfiedSoFar(result.unitsSatisfied);
    setDislikedSoFar(result.unitsUnsatisfied);
    setPriceSoFar(result.customersDeclinedPrice);
    setStockoutSoFar(result.customersLostStock);
    setRevenueSoFar(result.revenue);
    setDone(true);
  };

  const handleContinue = () => {
    useGameStore.getState().commitDayResult(result);
    maybeShowInterstitial();
    navigation.goBack();
  };

  // Rewarded ad: watch one, double the day's profit. Only offered on a
  // profitable day, once, and only when an ad is actually loaded.
  const adsRemoved = useGameStore((s) => s.adsRemoved);
  const canOfferBonus = adsSupported && !adsRemoved && !bonusClaimed && result.netProfit > 0;

  const handleWatchAd = async () => {
    if (watchingAd) return;
    setWatchingAd(true);
    const earned = await showRewarded();
    setWatchingAd(false);
    if (!earned) return;
    const granted = useGameStore.getState().claimRewardBonus(result.day, result.netProfit);
    if (granted) setBonusClaimed(true);
  };

  const passersBy = soldSoFar + priceSoFar + stockoutSoFar;
  const popularity = passersBy > 0 ? soldSoFar / passersBy : 0;
  const satisfaction = soldSoFar > 0 ? satisfiedSoFar / soldSoFar : 0;

  const eveningOpacity = dayClock.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0, 0.16] });
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.dayLabel}>{t('stand.day', { day: currentDay })}</Text>
          <View style={styles.weatherRow}>
            <Icon name={result.weather as IconName} size={20} />
            <Text style={styles.weatherLabel}>{t(`weather.${result.weather}.label`)}</Text>
          </View>
        </View>
        <View style={styles.clockTrack}>
          <Animated.View
            style={[
              styles.clockFill,
              { width: dayClock.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
            ]}
          />
        </View>

        <View style={styles.resourceStrip}>
          <View style={styles.cashChip}>
            <Icon name="cash" size={14} />
            <Text style={styles.cashChipText}>{formatMoney(cash + revenueSoFar, i18n.language)}</Text>
          </View>
          <View style={styles.resourceGroup}>
            <ResourceChip icon="flour" value={inventory.flour} />
            <ResourceChip icon="oil" value={inventory.oil} />
            <ResourceChip icon="sugar" value={inventory.sugar} />
            <ResourceChip icon="bag" value={inventory.wraps} />
          </View>
        </View>
      </View>

      <View style={styles.scene} onLayout={(e) => setSceneHeight(e.nativeEvent.layout.height)}>
        <SceneBackground width={SCREEN_WIDTH} height={sceneHeight} weather={result.weather} locationId={locationId} />

        {AMBIENT_LANES.map((lane, i) => (
          <AmbientWalker key={`amb${i}`} lane={lane} index={i} sceneHeight={sceneHeight} />
        ))}

        <View
          style={[
            styles.standArea,
            { bottom: laneBottom(sceneHeight, CART_LANE) - 6 },
          ]}
        >
          <StandRig
            price={formatMoney(price, i18n.language)}
            scale={CART_SCALE}
            soldOutLabel={stockoutSoFar > 0 ? t('simulation.soldOutSign') : undefined}
          />
        </View>

        {customers.map((customer, i) => (
          <CustomerSprite
            key={customer.id}
            customer={customer}
            progress={progressValues[i]}
            phrase={phrasesByType[customer.type][customer.phraseIndex % phrasesByType[customer.type].length]}
            sceneHeight={sceneHeight}
            umbrella={result.weather === 'rainy' && customer.id % 2 === 0}
          />
        ))}

        {coinPops.map((pop) => (
          <CoinPop
            key={pop.key}
            label={pop.label}
            left={pop.left}
            bottom={pop.bottom}
            onDone={() => setCoinPops((pops) => pops.filter((p) => p.key !== pop.key))}
          />
        ))}

        {result.weather === 'rainy' && <Rain height={sceneHeight} />}

        <Animated.View pointerEvents="none" style={[styles.evening, { opacity: eveningOpacity }]} />

        {!done && (
          <Pressable style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>{t('summary.skip')}</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{t('simulation.performance')}</Text>
        <View style={styles.panelRow}>
          <PanelStat icon="churro" label={t('simulation.sold')} value={`${soldSoFar}`} accent="#219653" />
          <PanelStat icon="cash" label={t('simulation.revenue')} value={formatMoney(revenueSoFar, i18n.language)} accent="#219653" />
          <PanelStat icon="coinOff" label={t('simulation.tooExpensive')} value={`${priceSoFar}`} accent="#C1440E" />
          <PanelStat icon="emptyCup" label={t('simulation.soldOut')} value={`${stockoutSoFar}`} accent="#7A6752" />
          <PanelStat icon="sad" label={t('simulation.disliked')} value={`${dislikedSoFar}`} accent="#B7891F" />
        </View>
        <Meter label={t('simulation.popularity')} value={popularity} color="#F2994A" />
        <Meter label={t('simulation.satisfaction')} value={satisfaction} color="#6FCF97" />
      </View>

      {done && (
        <View style={styles.resultsOverlay}>
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>{t('summary.title', { day: currentDay })}</Text>
            <View style={styles.resultsStats}>
              <StatPill label={t('summary.unitsSold')} value={`${result.unitsSold}`} tone="good" />
              <StatPill label={t('summary.unitsUnsatisfied')} value={`${result.unitsUnsatisfied}`} tone="bad" />
              <StatPill label={t('summary.declinedPrice')} value={`${result.customersDeclinedPrice}`} tone="bad" />
              <StatPill label={t('summary.lostStock')} value={`${result.customersLostStock}`} tone="bad" />
              <StatPill label={t('summary.revenue')} value={formatMoney(result.revenue, i18n.language)} tone="good" />
              <StatPill
                label={t('summary.ingredientCost')}
                value={formatMoney(result.ingredientCost, i18n.language)}
                tone="bad"
              />
              <StatPill label={t('summary.rent')} value={formatMoney(result.rent, i18n.language)} tone="bad" />
              <StatPill label={t('summary.tax')} value={formatMoney(result.tax, i18n.language)} tone="bad" />
              <StatPill
                label={t('summary.netProfit')}
                value={formatMoney(result.netProfit, i18n.language)}
                tone={result.netProfit >= 0 ? 'good' : 'bad'}
              />
            </View>
            {canOfferBonus && (
              <Pressable
                style={[styles.bonusButton, !rewardReady && styles.bonusButtonDisabled]}
                onPress={handleWatchAd}
                disabled={watchingAd || !rewardReady}
              >
                <Icon name="cash" size={18} />
                <Text style={styles.bonusText}>
                  {watchingAd || !rewardReady ? t('summary.loadingAd') : t('summary.doubleProfit')}
                </Text>
              </Pressable>
            )}
            {bonusClaimed && (
              <Text style={styles.bonusDone}>
                {t('summary.bonusClaimed', { amount: formatMoney(result.netProfit, i18n.language) })}
              </Text>
            )}
            <Pressable style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueText}>{t('summary.continueButton')}</Text>
            </Pressable>
            {__DEV__ && <Text style={styles.adsDebug}>ads: {adsStatus()}</Text>}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function ResourceChip({ icon, value }: { icon: IconName; value: number }) {
  return (
    <View style={styles.resourceChip}>
      <Icon name={icon} size={13} />
      <Text style={styles.resourceValue}>{value}</Text>
    </View>
  );
}

function PanelStat({
  icon,
  label,
  value,
  accent,
}: {
  icon: IconName;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <View style={styles.panelStat}>
      <Icon name={icon} size={17} />
      <Text style={styles.panelStatLabel}>{label}</Text>
      <Text style={[styles.panelStatValue, { color: accent }]}>{value}</Text>
    </View>
  );
}

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <View style={styles.meterRow}>
      <Text style={styles.meterLabel}>{label}</Text>
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.meterValue}>{pct}%</Text>
    </View>
  );
}

function CustomerSprite({
  customer,
  progress,
  phrase,
  sceneHeight,
  umbrella = false,
}: {
  customer: CustomerSpec;
  progress: Animated.Value;
  phrase: string;
  sceneHeight: number;
  umbrella?: boolean;
}) {
  const path = pathFor(customer.type, customer.slot);
  const translateX = progress.interpolate({
    inputRange: [0, ARRIVE_FRAC, HOLD_END_FRAC, 1],
    outputRange: path,
  });
  const bubbleOpacity = progress.interpolate({
    inputRange: [
      0,
      Math.max(0, ARRIVE_FRAC - 0.05),
      ARRIVE_FRAC,
      HOLD_END_FRAC,
      Math.min(1, HOLD_END_FRAC + 0.05),
      1,
    ],
    outputRange: [0, 0, 1, 1, 0, 0],
  });
  const scaleX = turnsAround(customer.type)
    ? progress.interpolate({
        inputRange: [0, HOLD_END_FRAC, HOLD_END_FRAC + 0.001, 1],
        outputRange: [1, 1, -1, -1],
      })
    : 1;

  const depth = laneScale(customer.lane);
  const bought = customer.type === 'satisfied' || customer.type === 'unsatisfied';
  const spriteSize = PERSON_BASE * depth;

  // Buyers leave the counter holding a cup of churros.
  const emptyHandedOpacity = bought
    ? progress.interpolate({ inputRange: [0, HOLD_END_FRAC, HOLD_END_FRAC + 0.001, 1], outputRange: [1, 1, 0, 0] })
    : 1;
  const carryingOpacity = bought
    ? progress.interpolate({ inputRange: [0, HOLD_END_FRAC, HOLD_END_FRAC + 0.001, 1], outputRange: [0, 0, 1, 1] })
    : 0;

  return (
    <Animated.View
      style={[styles.customer, { bottom: laneBottom(sceneHeight, customer.lane), transform: [{ translateX }] }]}
    >
      <Animated.View style={[styles.bubble, { backgroundColor: TYPE_COLORS[customer.type], opacity: bubbleOpacity }]}>
        <Text style={styles.bubbleText}>{phrase}</Text>
      </Animated.View>
      <Animated.View style={{ transform: [{ scaleX }], width: spriteSize, height: spriteSize * 1.5 }}>
        <Animated.View style={{ opacity: emptyHandedOpacity }}>
          <PersonSprite mood={customer.type} seed={customer.id} size={spriteSize} umbrella={umbrella} />
        </Animated.View>
        {bought && (
          <Animated.View style={[styles.spriteOverlay, { opacity: carryingOpacity }]}>
            <PersonSprite mood={customer.type} seed={customer.id} size={spriteSize} carrying umbrella={umbrella} />
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

function CoinPop({ label, left, bottom, onDone }: { label: string; left: number; bottom: number; onDone: () => void }) {
  const rise = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rise, { toValue: 1, duration: 1100, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(
      onDone
    );
  }, [rise, onDone]);

  const translateY = rise.interpolate({ inputRange: [0, 1], outputRange: [0, -46] });
  const opacity = rise.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 1, 0] });

  return (
    <Animated.View pointerEvents="none" style={[styles.coinPop, { left, bottom, opacity, transform: [{ translateY }] }]}>
      <Text style={styles.coinPopText}>{label}</Text>
    </Animated.View>
  );
}

function AmbientWalker({ lane, index, sceneHeight }: { lane: number; index: number; sceneHeight: number }) {
  const progress = useRef(new Animated.Value(0)).current;
  const rightward = index % 2 === 0;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 12000 + index * 3500,
        delay: index * 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [progress, index]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: rightward ? [-50, SCREEN_WIDTH + 50] : [SCREEN_WIDTH + 50, -50],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.customer,
        { bottom: laneBottom(sceneHeight, lane), opacity: 0.85, transform: [{ translateX }] },
      ]}
    >
      <View style={{ transform: [{ scaleX: rightward ? -1 : 1 }] }}>
        <PersonSprite mood="stockout" seed={index + 5} size={PERSON_BASE * laneScale(lane)} />
      </View>
    </Animated.View>
  );
}

function Rain({ height }: { height: number }) {
  const drop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(drop, { toValue: 1, duration: 700, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [drop]);

  const translateY = drop.interpolate({ inputRange: [0, 1], outputRange: [-60, height] });

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { transform: [{ translateY }] }]}>
      {Array.from({ length: 44 }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.raindrop,
            {
              left: (i * 41) % SCREEN_WIDTH,
              top: (i * 29) % Math.max(80, height),
            },
          ]}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6EFE4' },
  header: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  weatherRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dayLabel: { fontSize: 19, fontFamily: FONT.black, fontWeight: '800', color: '#4A2E1A' },
  weatherLabel: { fontSize: 14, fontFamily: FONT.bold, fontWeight: '700', color: '#7A6752' },
  clockTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E4D8C6',
    marginTop: 8,
    overflow: 'hidden',
  },
  clockFill: { height: '100%', backgroundColor: '#E8A855' },
  resourceStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cashChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E3F6E5',
    borderWidth: 1,
    borderColor: '#9AD9B0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  cashChipText: { fontSize: 13, fontFamily: FONT.black, fontWeight: '800', color: '#1E7A44' },
  resourceGroup: { flexDirection: 'row', gap: 6 },
  resourceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFDF8',
    borderWidth: 1,
    borderColor: '#E4D8C6',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  resourceValue: { fontSize: 11, fontFamily: FONT.bold, fontWeight: '700', color: '#7A6752' },

  scene: { flex: 1, overflow: 'hidden' },
  standArea: { position: 'absolute', left: 22 },
  customer: { position: 'absolute', alignItems: 'center' },
  bubble: {
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginBottom: 3,
    maxWidth: 130,
    borderWidth: 1,
    borderColor: 'rgba(74,46,26,0.15)',
  },
  bubbleText: { fontSize: 11, fontFamily: FONT.bold, fontWeight: '700', color: '#4A2E1A' },
  spriteOverlay: { position: 'absolute', top: 0, left: 0 },
  coinPop: { position: 'absolute' },
  coinPopText: {
    fontSize: 13,
    fontFamily: FONT.black, fontWeight: '900',
    color: '#1E7A44',
    textShadowColor: 'rgba(255,255,255,0.9)',
    textShadowRadius: 3,
  },
  evening: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#8A4A1E' },
  raindrop: {
    position: 'absolute',
    width: 1.5,
    height: 12,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.45)',
    transform: [{ rotate: '12deg' }],
  },
  skipButton: {
    position: 'absolute',
    right: 14,
    top: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: { color: '#FFF', fontFamily: FONT.bold, fontWeight: '700', fontSize: 12 },

  panel: {
    backgroundColor: '#FFFDF8',
    borderTopWidth: 1,
    borderColor: '#E4D8C6',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 8,
  },
  panelTitle: {
    fontSize: 11,
    fontFamily: FONT.black, fontWeight: '800',
    letterSpacing: 0.8,
    color: '#9C8A72',
  },
  panelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  panelStat: { alignItems: 'center', flex: 1, gap: 1 },
  panelStatLabel: { fontSize: 9, fontFamily: FONT.bold, fontWeight: '700', color: '#9C8A72', textAlign: 'center' },
  panelStatValue: { fontSize: 15, fontFamily: FONT.black, fontWeight: '800', fontVariant: ['tabular-nums'] },
  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  meterLabel: { fontSize: 11, fontFamily: FONT.bold, fontWeight: '700', color: '#7A6752', width: 88 },
  meterTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: '#EDE3D3', overflow: 'hidden' },
  meterFill: { height: '100%', borderRadius: 4 },
  meterValue: { fontSize: 11, fontFamily: FONT.bold, fontWeight: '700', color: '#7A6752', width: 34, textAlign: 'right' },

  resultsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(30,20,10,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  resultsCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    gap: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  resultsTitle: { fontSize: 20, fontFamily: FONT.black, fontWeight: '800', color: '#4A2E1A' },
  resultsStats: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  bonusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2FA664',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 20,
  },
  bonusButtonDisabled: { backgroundColor: '#B9C7BE' },
  bonusText: { color: '#FFF', fontFamily: FONT.black, fontWeight: '800', fontSize: 14.5 },
  adsDebug: { fontSize: 10, color: '#B0A192', fontFamily: FONT.medium },
  bonusDone: { color: '#1E7A44', fontFamily: FONT.bold, fontWeight: '700', fontSize: 13 },
  continueButton: { backgroundColor: '#C1440E', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32 },
  continueText: { color: '#FFF', fontFamily: FONT.black, fontWeight: '800', fontSize: 16 },
});
