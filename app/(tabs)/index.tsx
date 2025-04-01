import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { Link } from "expo-router";
import { getUserHabits, Habit, deleteHabit } from "@/services/firestore/database-service";
import { useEffect, useState } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function HabitScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHabits = async () => {
    try {
      const userHabits = await getUserHabits();
      setHabits(userHabits);
    } catch (error) {
      console.error("Error loading habits:", error);
      Alert.alert("Error", "Failed to load habits. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHabits();
  }, []);

  const handleDeleteHabit = async (habitId: string) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit(habitId);
              setHabits((prev) => prev.filter((habit) => habit.id !== habitId));
            } catch (error) {
              console.error("Error deleting habit:", error);
              Alert.alert("Error", "Failed to delete habit. Please try again later.");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  if (habits.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>You don't have any habits yet.</Text>
        <Link href="/create-habit-modal" style={styles.createButton}>
        <MaterialCommunityIcons name="plus-circle" size={50} color="green" />
      </Link>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.habitCard}>
            <View style={styles.habitHeader}>
            <Ionicons name={item.icon} size={36} color={'white'} />
              <Text style={styles.habitTitle}>{item.title}</Text>
              <TouchableOpacity 
                onPress={() => item.id && handleDeleteHabit(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color="red" />
              </TouchableOpacity>
            </View>
            <Text style={styles.habitDescription}>{item.description}</Text>
            <View style={styles.habitFrequency}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const fullDay = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index];
                const isSelected = item.frequency.includes(fullDay);
                
                return (
                  <View
                    key={day}
                    style={[
                      styles.dayIndicator,
                      isSelected && styles.dayIndicatorSelected
                    ]}
                  >
                    <Text 
                      style={[
                        styles.dayIndicatorText,
                        isSelected && styles.dayIndicatorTextSelected
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      />
      <Link href="/create-habit-modal" style={styles.createButton}>
        <MaterialCommunityIcons name="plus-circle" size={50} color="green" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#003049',
  },
  createButton: {
    flex: 1,
    flexDirection: "column",
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  habitCard: {
    backgroundColor: '#669bbc',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  habitDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  habitFrequency: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayIndicatorSelected: {
    backgroundColor: 'green',
  },
  dayIndicatorText: {
    fontSize: 12,
    color: '#666',
  },
  dayIndicatorTextSelected: {
    color: 'white',
  },
});
