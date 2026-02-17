import { View, Text, StyleSheet } from 'react-native';
import { AuraBackground } from '@/src/components/AuraBackground';

export default function ProfileScreen() {
  return (
    <AuraBackground>
      <View style={styles.container}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </View>
        <Text style={styles.userName}>Front-End Dev</Text>
        <Text style={styles.userStatus}>Level 5 • Aura Enthusiast</Text>
      </View>
    </AuraBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarEmoji: { fontSize: 40 },
  userName: { 
    color: '#fff', 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  userStatus: { 
    color: '#38BDF8', 
    marginTop: 8, 
    fontSize: 14,
    letterSpacing: 1
  },
});