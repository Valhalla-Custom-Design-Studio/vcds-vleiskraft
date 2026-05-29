import React from 'react';
import { View, StyleSheet } from 'react-native';

type HeatLevel = 'Low' | 'Medium' | 'Medium-High' | 'High' | 'Very High';

const HEAT_STEPS: Record<HeatLevel, number> = {
  'Low': 1, 'Medium': 2, 'Medium-High': 3, 'High': 4, 'Very High': 5,
};

const HEAT_COLORS: Record<number, string> = {
  1: '#22C55E', 2: '#EAB308', 3: '#F97316', 4: '#EF4444', 5: '#DC2626',
};

interface HeatBarProps {
  level: HeatLevel;
}

export const HeatBar: React.FC<HeatBarProps> = ({ level }) => {
  const filled = HEAT_STEPS[level] ?? 1;
  const color = HEAT_COLORS[filled];
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map(i => (
        <View
          key={i}
          style={[
            styles.bar,
            {
              backgroundColor: i <= filled ? color : '#2A2A2A',
              ...(i <= filled ? {
                shadowColor: color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 4,
                elevation: 4,
              } : {}),
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  bar: { width: 28, height: 6, borderRadius: 3 },
});
