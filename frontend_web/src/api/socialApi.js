import axios from './axios';
import { API_ENDPOINTS } from '../utils/ConstantSystems';

const socialApi = {
    // Posts
    getFeed: (limit = 10, page = 1, params = {}) => axios.get(API_ENDPOINTS.SOCIAL_POSTS, { params: { limit, page, ...params } }),
    createPost: (data) => axios.post(API_ENDPOINTS.SOCIAL_POSTS, data),
    getPostDetail: (id) => axios.get(API_ENDPOINTS.SOCIAL_POSTS + '/' + id),
    deletePost: (id) => axios.delete(API_ENDPOINTS.SOCIAL_POSTS + '/' + id),
    searchUsers: (query) => axios.get('/social/users/search', { params: { q: query } }),
    getUserPosts: (userId) => axios.get(API_ENDPOINTS.SOCIAL_USER_POSTS(userId)),
    getUserReplies: (userId) => axios.get(API_ENDPOINTS.SOCIAL_USER_REPLIES(userId)),

    // Interactions
    toggleLike: (postId) => axios.post(API_ENDPOINTS.SOCIAL_LIKE(postId)),
    getComments: (postId) => axios.get(API_ENDPOINTS.SOCIAL_COMMENTS(postId)),
    addComment: (postId, content) => axios.post(API_ENDPOINTS.SOCIAL_COMMENTS(postId), { content }),

    // Follows
    toggleFollow: (userId) => axios.post(API_ENDPOINTS.SOCIAL_FOLLOW(userId)),
    getFollowers: (userId) => axios.get(API_ENDPOINTS.SOCIAL_FOLLOWERS(userId)),
    getFollowing: (userId) => axios.get(API_ENDPOINTS.SOCIAL_FOLLOWING(userId)),
    getSuggestions: () => axios.get(API_ENDPOINTS.SOCIAL_SUGGESTIONS),

    // Tags
    getTagSuggestions: (query) => axios.get(`${API_ENDPOINTS.SOCIAL_TAG_SUGGESTIONS}?q=${query}`),
};

export default socialApi;
