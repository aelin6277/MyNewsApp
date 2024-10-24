import React, { useState } from 'react';
import { Text, View, Button, StyleSheet, FlatList } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Definiera typen för nyhetsartiklar
type NewsArticle = {
  title: string;
  description: string;
};

// Definiera typen för din stack
type RootStackParamList = {
  Home: undefined;
  Details: undefined;
};

// Typa navigation-prop med StackNavigationProp
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello, welcome to my news app!</Text>
      <Button title="Go to Details" onPress={() => navigation.navigate('Details')} />
    </View>
  );
};

// Uppdatera DetailsScreen för att hämta API-data
const DetailsScreen = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);  // Använd typen NewsArticle för API-data
  const [loading, setLoading] = useState(false);

  // Funktion för att hämta API-data
  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://newsapi.org/v2/top-headlines?country=us&apiKey=d7ded560865141efa0fbe50980a33acd');
      const data = await response.json();
      setNews(data.articles);  // Spara nyhetsartiklarna i state
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>This is the Details Screen</Text>
      <Button title="Fetch News" onPress={fetchNews} />
      {news.length > 0 && (
        <FlatList
          data={news}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.newsItem}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  text: {
    fontSize: 20,
    color: '#333',
    marginBottom: 20,
  },
  newsItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
  },
});

export default App;
