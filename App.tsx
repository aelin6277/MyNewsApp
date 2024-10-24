import React, { useState, useEffect } from 'react';
import { Text, View, Button, StyleSheet, FlatList, Linking, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';

// Hårdkoda API-nyckeln här, eller använd en miljövariabel via .env-fil
const API_KEY = 'd7ded560865141efa0fbe50980a33acd';

// Definiera typen för nyhetsartiklar
type NewsArticle = {
  title: string;
  description: string;
  urlToImage: string;
  url: string;
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
    // Hämta redan sparade artiklar från AsyncStorage
    const savedArticles = await AsyncStorage.getItem('savedArticles');
    const parsedArticles = savedArticles ? JSON.parse(savedArticles) : [];

    // Kolla om artikeln redan är sparad
    const isArticleSaved = parsedArticles.some((savedArticle: NewsArticle) => savedArticle.title === article.title);


    if (!isArticleSaved) {
      // Lägg till artikeln i listan om den inte redan är sparad
      const newArticles = [...parsedArticles, article];
      await AsyncStorage.setItem('savedArticles', JSON.stringify(newArticles));
      alert('Article saved!');
    } else {
      alert('This article is already saved.');
    }
  } catch (error) {
    console.error('Error saving article:', error);
  }
};

// Funktion för att öppna artikel i webbläsare
const openArticle = (url: string) => {
  Linking.openURL(url).catch(err => console.error('Failed to open page', err));
};

const DetailsScreen = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); // För paginering
  const [hasMore, setHasMore] = useState(true); // För att kontrollera om det finns fler artiklar

  // Funktion för att hämta nyheter
  const fetchNews = async (pageNumber: number) => {
    if (!hasMore || loading) return; // Om vi laddar eller inte har fler nyheter, returnera

    setLoading(true);
    try {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}&page=${pageNumber}&pageSize=10`
      );
      const data = await response.json();

      if (data.articles.length > 0) {
        setNews(prevNews => [...prevNews, ...data.articles]); // Lägg till nya artiklar till den existerande listan
      } else {
        setHasMore(false); // Stoppa hämtning om inga fler artiklar finns
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  // Första hämtning av nyheter när komponenten mountas
  useEffect(() => {
    fetchNews(page);
  }, [page]);

  // Funktion för att ladda fler artiklar när "Load More" klickas
  const loadMoreNews = () => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1); // Öka sidan för att hämta nästa sida
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={news}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.newsItem}>
            {item.urlToImage ? (
              <Image source={{ uri: item.urlToImage }} style={styles.image} />
            ) : null}
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Button title="Save Article" onPress={() => saveArticle(item)} />
            {/* Ny knapp för att öppna artikeln */}
            <TouchableOpacity onPress={() => openArticle(item.url)}>
              <Text style={styles.readMore}>Read Article</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          hasMore ? (
            <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreNews}>
              <Text style={styles.loadMoreText}>{loading ? 'Loading...' : 'Load More'}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.noMoreText}>No more articles to load.</Text>
          )
        } // Lägg till en knapp för att ladda fler artiklar eller visa ett meddelande om att det inte finns fler
      />
    </View>
  );
};


// Skärm för att visa sparade artiklar
const SavedArticlesScreen = () => {
  const [savedArticles, setSavedArticles] = useState<NewsArticle[]>([]);

  // Funktion för att hämta sparade artiklar från AsyncStorage
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

  // Funktion för att radera en sparad artikel
  const deleteArticle = async (article: NewsArticle) => {
    try {
      // Hämta alla sparade artiklar från AsyncStorage
      const savedArticles = await AsyncStorage.getItem('savedArticles');
      const parsedArticles = savedArticles ? JSON.parse(savedArticles) : [];

      // Filtrera bort den artikel som ska raderas
      const updatedArticles = parsedArticles.filter(
        (savedArticle: NewsArticle) => savedArticle.title !== article.title
      );

      // Uppdatera AsyncStorage med den nya listan utan den raderade artikeln
      await AsyncStorage.setItem('savedArticles', JSON.stringify(updatedArticles));

      // Uppdatera lokalt state så att listan i UI också uppdateras
      setSavedArticles(updatedArticles);
      alert('Article deleted!');
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  // Hämta sparade artiklar när komponenten laddas
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
              <Button title="Delete Article" onPress={() => deleteArticle(item)} />
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
  image: {
    width: '100%',
    height: 100,
    marginBottom: 10,
  },
  loadMoreButton: {
    padding: 10,
    backgroundColor: '#007bff',
    alignItems: 'center',
    marginVertical: 20,
  },
  loadMoreText: {
    color: '#fff',
    fontSize: 16,
  },
  noMoreText: {
    textAlign: 'center',
    color: '#333',
    padding: 10,
    fontSize: 16,
  },
  readMore: {
    color: '#007bff',
    marginTop: 10,
    fontSize: 16,
  },
});

export default App;
