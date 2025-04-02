import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Title,
  Chip,
  ActivityIndicator,
  Searchbar,
  Avatar,
  IconButton,
  Divider,
  FAB
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../config/theme';

// Sample data for experts
const mockExperts = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    expertise: 'Plant Pathologist',
    specialization: ['Tomato Diseases', 'Fungal Infections'],
    bio: 'Expert in plant disease diagnosis with 15 years of experience in agricultural research.',
    rating: 4.9,
    reviews: 127,
    available: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    expertise: 'Veterinarian',
    specialization: ['Cattle', 'Poultry'],
    bio: 'Specialized in livestock diseases and preventive care for farm animals.',
    rating: 4.8,
    reviews: 93,
    available: true,
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '3',
    name: 'Dr. Amanda Garcia',
    expertise: 'Agricultural Entomologist',
    specialization: ['Pest Management', 'Integrated Pest Control'],
    bio: 'Specialized in identifying and managing insect pests that affect crops.',
    rating: 4.7,
    reviews: 68,
    available: false,
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '4',
    name: 'Dr. Robert Wilson',
    expertise: 'Soil Scientist',
    specialization: ['Soil Health', 'Nutrient Management'],
    bio: 'Expert in soil-related issues affecting plant health and crop productivity.',
    rating: 4.6,
    reviews: 52,
    available: true,
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
  },
  {
    id: '5',
    name: 'Dr. Emily Patel',
    expertise: 'Livestock Health Specialist',
    specialization: ['Dairy Cattle', 'Sheep', 'Goats'],
    bio: 'Specialized in diagnosing and treating diseases affecting farm animals.',
    rating: 4.9,
    reviews: 114,
    available: true,
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
  }
];

// Sample data for community posts
const mockPosts = [
  {
    id: '1',
    user: {
      id: 'user1',
      name: 'John Farmer',
      avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
    },
    content: 'Just discovered some unusual spots on my tomato plants. Has anyone else experienced this? I\'ve attached a photo.',
    imageUrl: 'https://extension.umd.edu/sites/extension.umd.edu/files/styles/optimized/public/2021-03/blight.jpg?itok=OppNAKjG',
    likes: 12,
    comments: 8,
    timestamp: '3 hours ago',
    tags: ['Tomato', 'Plant disease']
  },
  {
    id: '2',
    user: {
      id: 'user2',
      name: 'Maria Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
    },
    content: 'Got amazing results with organic treatment for powdery mildew. Mix 1 tablespoon baking soda, 1 teaspoon mild soap, and 1 gallon of water. Spray on affected plants weekly.',
    imageUrl: null,
    likes: 28,
    comments: 15,
    timestamp: '1 day ago',
    tags: ['Organic', 'Treatment', 'Tip']
  },
  {
    id: '3',
    user: {
      id: 'user3',
      name: 'Ahmed Hassan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
    },
    content: 'One of my cows has been showing reduced appetite and seems lethargic. The vet diagnosed early mastitis. Started antibiotics today. Remember to check your dairy cows regularly!',
    imageUrl: null,
    likes: 17,
    comments: 12,
    timestamp: '2 days ago',
    tags: ['Dairy', 'Livestock health', 'Mastitis']
  }
];

const CommunityScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('experts');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [experts, setExperts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery && activeTab === 'experts') {
      // Filter experts
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = mockExperts.filter(expert =>
        expert.name.toLowerCase().includes(lowercaseQuery) ||
        expert.expertise.toLowerCase().includes(lowercaseQuery) ||
        expert.specialization.some(spec => spec.toLowerCase().includes(lowercaseQuery))
      );
      setExperts(filtered);
    } else if (searchQuery && activeTab === 'posts') {
      // Filter posts
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = mockPosts.filter(post =>
        post.content.toLowerCase().includes(lowercaseQuery) ||
        post.user.name.toLowerCase().includes(lowercaseQuery) ||
        post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
      setPosts(filtered);
    } else {
      // No search, show all
      if (activeTab === 'experts') {
        setExperts(mockExperts);
      } else {
        setPosts(mockPosts);
      }
    }
  }, [searchQuery, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // In a real app, fetch from API
      // For demo, use mock data
      setTimeout(() => {
        setExperts(mockExperts);
        setPosts(mockPosts);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching data:', error);
      setExperts([]);
      setPosts([]);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const contactExpert = (expert) => {
    Alert.alert(
      'Contact Expert',
      `Would you like to connect with ${expert.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Connect', onPress: () => Alert.alert('Demo', 'This is a demo feature. In a real app, this would connect you with the expert.') }
      ]
    );
  };

  const likePost = (postId) => {
    // In a real app, send like to API
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return { ...post, likes: post.likes + 1 };
      }
      return post;
    });

    setPosts(updatedPosts);
  };

  const commentOnPost = (postId) => {
    Alert.alert('Demo', 'This is a demo feature. In a real app, this would open a comment form.');
  };

  const createNewPost = () => {
    Alert.alert('Demo', 'This is a demo feature. In a real app, this would open a form to create a new community post.');
  };

  const renderExpertItem = ({ item }) => (
    <Card style={styles.expertCard}>
      <Card.Content>
        <View style={styles.expertHeader}>
          {item.avatar ? (
            <Avatar.Image
              source={{ uri: item.avatar }}
              size={60}
            />
          ) : (
            <Avatar.Icon
              icon="account"
              size={60}
              style={{ backgroundColor: theme.colors.primary }}
            />
          )}

          <View style={styles.expertInfo}>
            <Text style={styles.expertName}>{item.name}</Text>
            <Text style={styles.expertTitle}>{item.expertise}</Text>
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating} ({item.reviews} reviews)</Text>
            </View>
          </View>

          <Chip
            style={{
              backgroundColor: item.available ? theme.colors.lightGreen : theme.colors.lightGray
            }}
          >
            {item.available ? 'Available' : 'Busy'}
          </Chip>
        </View>

        <View style={styles.specializations}>
          {item.specialization.map((spec, index) => (
            <Chip key={index} style={styles.specializationChip} textStyle={styles.specializationText}>
              {spec}
            </Chip>
          ))}
        </View>

        <Text style={styles.expertBio}>{item.bio}</Text>

        <Button
          mode="contained"
          onPress={() => contactExpert(item)}
          style={[
            styles.contactButton,
            { backgroundColor: item.available ? theme.colors.primary : theme.colors.gray }
          ]}
          disabled={!item.available}
        >
          Contact Expert
        </Button>
      </Card.Content>
    </Card>
  );

  const renderPostItem = ({ item }) => (
    <Card style={styles.postCard}>
      <Card.Content>
        <View style={styles.postHeader}>
          {item.user.avatar ? (
            <Avatar.Image
              source={{ uri: item.user.avatar }}
              size={40}
            />
          ) : (
            <Avatar.Icon
              icon="account"
              size={40}
              style={{ backgroundColor: theme.colors.primary }}
            />
          )}

          <View style={styles.postUserInfo}>
            <Text style={styles.postUserName}>{item.user.name}</Text>
            <Text style={styles.postTimestamp}>{item.timestamp}</Text>
          </View>
        </View>

        <Text style={styles.postContent}>{item.content}</Text>

        {item.imageUrl && (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.postImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.tagContainer}>
          {item.tags.map((tag, index) => (
            <Chip key={index} style={styles.tagChip} textStyle={styles.tagText}>
              {tag}
            </Chip>
          ))}
        </View>

        <Divider style={styles.divider} />

        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.postActionButton}
            onPress={() => likePost(item.id)}
          >
            <MaterialCommunityIcons name="thumb-up-outline" size={20} color={theme.colors.gray} />
            <Text style={styles.postActionText}>{item.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.postActionButton}
            onPress={() => commentOnPost(item.id)}
          >
            <MaterialCommunityIcons name="comment-outline" size={20} color={theme.colors.gray} />
            <Text style={styles.postActionText}>{item.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.postActionButton}>
            <MaterialCommunityIcons name="share-outline" size={20} color={theme.colors.gray} />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const EmptyExpertsComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="account-group" size={60} color={theme.colors.gray} />
      <Text style={styles.emptyText}>No experts found</Text>
    </View>
  );

  const EmptyPostsComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="post" size={60} color={theme.colors.gray} />
      <Text style={styles.emptyText}>No community posts found</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Searchbar
          placeholder={activeTab === 'experts' ? "Search experts..." : "Search community posts..."}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'experts' && styles.activeTab
            ]}
            onPress={() => setActiveTab('experts')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'experts' && styles.activeTabText
            ]}>
              Experts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'posts' && styles.activeTab
            ]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'posts' && styles.activeTabText
            ]}>
              Community Posts
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>
              Loading {activeTab === 'experts' ? 'experts' : 'community posts'}...
            </Text>
          </View>
        ) : (
          activeTab === 'experts' ? (
            <FlatList
              data={experts}
              renderItem={renderExpertItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={EmptyExpertsComponent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[theme.colors.primary]}
                />
              }
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            <FlatList
              data={posts}
              renderItem={renderPostItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={EmptyPostsComponent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[theme.colors.primary]}
                />
              }
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )
        )}

        {activeTab === 'posts' && (
          <FAB
            style={styles.fab}
            icon="plus"
            onPress={createNewPost}
            color="#fff"
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  searchBar: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.gray,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  expertCard: {
    marginVertical: 4,
    borderRadius: 10,
    elevation: 2,
  },
  expertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  expertInfo: {
    flex: 1,
    marginLeft: 12,
  },
  expertName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  expertTitle: {
    fontSize: 14,
    color: theme.colors.gray,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
    color: theme.colors.gray,
  },
  specializations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  specializationChip: {
    margin: 2,
    backgroundColor: theme.colors.lightGray,
  },
  specializationText: {
    fontSize: 12,
  },
  expertBio: {
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  contactButton: {
    marginTop: 8,
  },
  postCard: {
    marginVertical: 4,
    borderRadius: 10,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postUserInfo: {
    marginLeft: 12,
  },
  postUserName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postTimestamp: {
    fontSize: 12,
    color: theme.colors.gray,
  },
  postContent: {
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tagChip: {
    margin: 2,
    backgroundColor: theme.colors.lightGray,
  },
  tagText: {
    fontSize: 12,
  },
  divider: {
    marginVertical: 8,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 4,
  },
  postActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  postActionText: {
    marginLeft: 4,
    color: theme.colors.gray,
  },
  separator: {
    height: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: theme.colors.gray,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 16,
    color: theme.colors.gray,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 16,
    backgroundColor: theme.colors.primary,
  },
});

export default CommunityScreen;
