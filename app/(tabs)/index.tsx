import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { TopTabs } from '@/components/TopTabs';

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <TopTabs></TopTabs>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
