import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { formatZAR } from '../utils/formatZAR';
import { formatDate } from '../utils/formatDate';

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

interface Props {
  data: ChartDataPoint[];
  title: string;
  valuePrefix?: string;
  isCurrency?: boolean;
  locale?: 'en' | 'af';
}

/**
 * ChartWithTableToggle — WCAG 2.1 AA compliant chart with accessible table fallback
 * Satisfies WCAG 1.4.1 (no colour alone) and 1.1.1 (text alternative for charts)
 * Used by: VleisKraft™ Sales Reports (Screen 4), Fitness & Fuel™ Progress (Screen 10)
 */
const ChartWithTableToggle: React.FC<Props> = ({ data, title, isCurrency = false, locale = 'en' }) => {
  const [showTable, setShowTable] = useState(false);
  const maxVal = Math.max(...data.map(d => d.value), 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          onPress={() => setShowTable(v => !v)}
          accessibilityRole="switch"
          accessibilityLabel={showTable ? 'Switch to chart view' : 'Switch to table view (screen reader friendly)'}
          accessibilityState={{ checked: showTable }}
          style={styles.toggle}
        >
          <Text style={styles.toggleText}>{showTable ? '📊 Chart' : '📋 Table'}</Text>
        </TouchableOpacity>
      </View>

      {showTable ? (
        <ScrollView accessibilityRole="none">
          <View accessibilityRole="table" accessibilityLabel={`${title} data table`}>
            <View style={styles.tableHeader} accessibilityRole="row">
              <Text style={[styles.tableCell, styles.tableHeaderText]} accessibilityRole="columnheader">Period</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText]} accessibilityRole="columnheader">Value</Text>
            </View>
            {data.map((d, i) => (
              <View key={i} style={styles.tableRow} accessibilityRole="row">
                <Text style={styles.tableCell} accessibilityRole="cell">{d.label}</Text>
                <Text style={styles.tableCell} accessibilityRole="cell">
                  {isCurrency ? formatZAR(d.value) : d.value.toLocaleString('en-ZA')}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.chart} accessibilityLabel={`${title} bar chart. Switch to table view for accessible data.`}>
          {data.map((d, i) => (
            <View key={i} style={styles.barGroup} accessibilityElementsHidden>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { height: Math.max((d.value / maxVal) * 120, 4) }]} />
              </View>
              <Text style={styles.barLabel} numberOfLines={1}>{d.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginVertical: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '700', color: '#1A1A2E' },
  toggle: { backgroundColor: '#F0F4FF', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
  toggleText: { fontSize: 12, fontWeight: '600', color: '#1A1A2E' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 140, justifyContent: 'space-around' },
  barGroup: { alignItems: 'center', flex: 1 },
  barContainer: { height: 120, justifyContent: 'flex-end' },
  bar: { width: 24, backgroundColor: '#1A1A2E', borderRadius: 4 },
  barLabel: { fontSize: 10, color: '#666', marginTop: 4, textAlign: 'center' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F5F5F5', padding: 8 },
  tableHeaderText: { fontWeight: '700' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEE', padding: 8 },
  tableCell: { flex: 1, fontSize: 13, color: '#333' },
});

export default ChartWithTableToggle;
