import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, Linking, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadow } from '@/constants/colors';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuthStore } from '@/store/authStore';
import { t } from '@/locales';

const STORAGE_KEY = 'vleiskraft_emergency_contacts';

interface Contact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

export default function EmergencyContactsScreen() {
  const { language } = useAuthStore();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) setContacts(JSON.parse(raw));
      setLoading(false);
    });
  }, []);

  const save = async (updated: Contact[]) => {
    setContacts(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const add = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert(language === 'af' ? 'Vereiste Velde' : 'Required Fields',
        language === 'af' ? 'Naam en nommer is verpligtend.' : 'Name and number are required.');
      return;
    }
    const contact: Contact = { id: Date.now().toString(), name: name.trim(), phone: phone.trim(), relation: relation.trim() };
    await save([...contacts, contact]);
    setName(''); setPhone(''); setRelation(''); setAdding(false);
  };

  const remove = (id: string) => {
    Alert.alert(
      language === 'af' ? 'Verwyder Kontak' : 'Remove Contact',
      language === 'af' ? 'Is jy seker?' : 'Are you sure?',
      [{ text: language === 'af' ? 'Kanselleer' : 'Cancel', style: 'cancel' },
       { text: language === 'af' ? 'Verwyder' : 'Remove', style: 'destructive', onPress: () => save(contacts.filter(c => c.id !== id)) }]
    );
  };

  const call = (phone: string) => Linking.openURL(`tel:${phone}`);
  const whatsapp = (phone: string) => Linking.openURL(`https://wa.me/${phone.replace(/\D/g, '')}`);

  if (loading) return <View style={s.center}><ActivityIndicator color={Colors.primary} /></View>;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Ionicons name="people-outline" size={24} color={Colors.primary} />
        <Text style={s.title}>{language === 'af' ? 'Noodkontakte' : 'Emergency Contacts'}</Text>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={c => c.id}
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: 120 }}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="person-add-outline" size={48} color={Colors.textSecondary} />
            <Text style={s.emptyText}>{language === 'af' ? 'Geen noodkontakte nie' : 'No emergency contacts'}</Text>
            <Text style={s.emptySubText}>{language === 'af' ? 'Voeg jou eerste kontak by' : 'Add your first contact'}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <GlassCard style={s.card}>
            <View style={s.cardTop}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{item.name[0].toUpperCase()}</Text>
              </View>
              <View style={s.info}>
                <Text style={s.name}>{item.name}</Text>
                {item.relation ? <Text style={s.relation}>{item.relation}</Text> : null}
                <Text style={s.phone}>{item.phone}</Text>
              </View>
              <TouchableOpacity onPress={() => remove(item.id)} style={s.deleteBtn}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
            <View style={s.actions}>
              <TouchableOpacity style={s.actionBtn} onPress={() => call(item.phone)}>
                <Ionicons name="call-outline" size={16} color={Colors.primary} />
                <Text style={s.actionText}>{language === 'af' ? 'Bel' : 'Call'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.actionBtn, s.waBtn]} onPress={() => whatsapp(item.phone)}>
                <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                <Text style={[s.actionText, { color: '#25D366' }]}>WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        )}
      />

      {adding && (
        <View style={s.form}>
          <TextInput style={s.input} placeholder={language === 'af' ? 'Naam *' : 'Name *'}
            placeholderTextColor={Colors.textSecondary} value={name} onChangeText={setName} />
          <TextInput style={s.input} placeholder={language === 'af' ? 'Nommer *' : 'Number *'}
            placeholderTextColor={Colors.textSecondary} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextInput style={s.input} placeholder={language === 'af' ? 'Verhouding (opsioneel)' : 'Relation (optional)'}
            placeholderTextColor={Colors.textSecondary} value={relation} onChangeText={setRelation} />
          <View style={s.formBtns}>
            <TouchableOpacity style={s.cancelBtn} onPress={() => setAdding(false)}>
              <Text style={s.cancelText}>{language === 'af' ? 'Kanselleer' : 'Cancel'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.saveBtn} onPress={add}>
              <Text style={s.saveText}>{language === 'af' ? 'Stoor' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!adding && (
        <TouchableOpacity style={s.fab} onPress={() => setAdding(true)}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: Spacing.lg, paddingBottom: Spacing.sm },
  title: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600' },
  emptySubText: { color: Colors.textSecondary, fontSize: 13 },
  card: { marginBottom: Spacing.sm },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary + '25', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.primary, fontWeight: '800', fontSize: 18 },
  info: { flex: 1 },
  name: { color: Colors.textPrimary, fontWeight: '700', fontSize: 15 },
  relation: { color: Colors.textSecondary, fontSize: 12, marginTop: 1 },
  phone: { color: Colors.primary, fontSize: 13, marginTop: 2 },
  deleteBtn: { padding: 6 },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: Radius.sm, backgroundColor: Colors.primary + '15', borderWidth: 1, borderColor: Colors.primary + '30' },
  waBtn: { backgroundColor: '#25D36615', borderColor: '#25D36630' },
  actionText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },
  form: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.surface, padding: Spacing.lg, borderTopLeftRadius: 20, borderTopRightRadius: 20, ...Shadow.lg },
  input: { backgroundColor: Colors.background, borderRadius: Radius.sm, padding: Spacing.sm, color: Colors.textPrimary, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  formBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, padding: Spacing.sm, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  cancelText: { color: Colors.textSecondary },
  saveBtn: { flex: 1, padding: Spacing.sm, borderRadius: Radius.sm, backgroundColor: Colors.primary, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700' },
  fab: { position: 'absolute', bottom: 30, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadow.lg },
});
