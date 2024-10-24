import React, { useState, useEffect } from 'react'; 
import { Text, View, Button, StyleSheet, FlatList } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';



// Hårdkoda API-nyckeln här
const API_KEY = 'din_riktiga_api_nyckel';

// Definiera typen för nyhetsartiklar
type NewsArticle = {
  title: string;
  description: string;
};

// Definiera typen för din stack
type RootStackParamList = {
  Home: undefined;
  Details: undefined;
  SavedArticles: undefined;
};

// Typa navigation-prop med StackNavigationProp
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello, welcome to my news app!</Text>
      <Button title="Go to Details" onPress={() => navigation.navigate('Details')} />
      <Button title="View Saved Articles" onPress={() => navigation.navigate('SavedArticles')} />
    </View>
  );
};

// Funktion för att spara artikel till AsyncStorage
const saveArticle = async (article: NewsArticle) => {
  try {
    const savedArticles = await AsyncStorage.getItem('savedArticles');
    const parsedArticles = savedArticles ? JSON.parse(savedArticles) : [];
    const newArticles = [...parsedArticles, article];
    await AsyncStorage.setItem('savedArticles', JSON.stringify(newArticles));
    alert('Article saved!');
  } catch (error) {
    console.error('Error saving article:', error);
  }
};

const DetailsScreen = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    try {
        const response = await fetch('https://newsapi.org/v2/top-headlines?country=us&apiKey=d7ded560865141efa0fbe50980a33acd');      const data = await response.json();
      setNews(data.articles);
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
      <Button title="Fetch News" onPress={fetchNews} />
      {news.length > 0 && (
        <FlatList
          data={news}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.newsItem}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Button title="Save Article" onPress={() => saveArticle(item)} />
            </View>
          )}
        />
      )}
    </View>
  );
};

// Skärm för att visa sparade artiklar
const SavedArticlesScreen = () => {
  const [savedArticles, setSavedArticles] = useState<NewsArticle[]>([]);

  const getSavedArticles = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedArticles');
      if (saved) {
        setSavedArticles(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error fetching saved articles:', error);
    }
  };

  useEffect(() => {
    getSavedArticles();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Saved Articles</Text>
      {savedArticles.length > 0 ? (
        <FlatList
          data={savedArticles}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.newsItem}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          )}
        />
      ) : (
        <Text>No saved articles yet.</Text>
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
        <Stack.Screen name="SavedArticles" component={SavedArticlesScreen} />
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
