const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIMatchingService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.cache = new Map(); // Cache for similarity calculations
    this.userPreferences = new Map(); // User preference learning
  }

  // Enhanced semantic similarity with caching and context awareness
  async calculateSimilarity(item1, item2, context = {}) {
    try {
      // Create cache key
      const cacheKey = `${item1.title}_${item2.title}_${JSON.stringify(context)}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const prompt = `You are an expert at evaluating item compatibility for bartering. Analyze these two items and provide a compatibility score from 0-100.

ITEM 1: "${item1.title}"
Description: ${item1.description}
Wants: ${item1.want_item} - ${item1.want_description}
Category: ${item1.category || 'Unknown'}
Condition: ${item1.condition || 'Unknown'}

ITEM 2: "${item2.title}"
Description: ${item2.description}
Wants: ${item2.want_item} - ${item2.want_description}
Category: ${item2.category || 'Unknown'}
Condition: ${item2.condition || 'Unknown'}

CONTEXT: ${JSON.stringify(context)}

Consider:
- Value equivalence (are items of similar worth?)
- Category compatibility (electronics with electronics, etc.)
- Condition matching (excellent with excellent, etc.)
- User preferences and past successful trades
- Market demand and rarity
- Practical utility for both parties

Provide ONLY the numerical score (0-100).`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const score = parseInt(text.trim()) || 0;
      
      // Cache the result
      this.cache.set(cacheKey, score);
      
      return score;
    } catch (error) {
      console.error('Error calculating similarity with Gemini:', error);
      return 0;
    }
  }

  // Find direct matches for a listing
  async findMatches(targetListing, allListings) {
    const matches = [];
    for (const listing of allListings) {
      if (listing.id === targetListing.id) continue;

      // Check if targetListing wants something similar to what 'listing' offers
      const directMatchScore = await this.calculateSimilarity(
        { title: targetListing.want_item, description: targetListing.want_description },
        { title: listing.title, description: listing.description }
      );

      // Check if 'listing' wants something similar to what targetListing offers
      const reverseMatchScore = await this.calculateSimilarity(
        { title: listing.want_item, description: listing.want_description },
        { title: targetListing.title, description: targetListing.description }
      );

      if (directMatchScore > 50 || reverseMatchScore > 50) { // Threshold for a "match"
        matches.push({
          listing,
          directMatchScore,
          reverseMatchScore,
          overallScore: (directMatchScore + reverseMatchScore) / 2,
          type: 'direct'
        });
      }
    }
    return matches.sort((a, b) => b.overallScore - a.overallScore);
  }

  // Find chain trades (A -> B -> C -> A)
  async findChainTrades(targetListing, allListings) {
    const chains = [];
    const A = targetListing;

    for (const B of allListings) {
      if (B.id === A.id) continue;

      // A wants B's item
      const A_wants_B_score = await this.calculateSimilarity(
        { title: A.want_item, description: A.want_description },
        { title: B.title, description: B.description }
      );
      if (A_wants_B_score < 60) continue; // A must strongly want B's item

      for (const C of allListings) {
        if (C.id === A.id || C.id === B.id) continue;

        // B wants C's item
        const B_wants_C_score = await this.calculateSimilarity(
          { title: B.want_item, description: B.want_description },
          { title: C.title, description: C.description }
        );
        if (B_wants_C_score < 60) continue; // B must strongly want C's item

        // C wants A's item
        const C_wants_A_score = await this.calculateSimilarity(
          { title: C.want_item, description: C.want_description },
          { title: A.title, description: A.description }
        );
        if (C_wants_A_score < 60) continue; // C must strongly want A's item

        const overallChainScore = (A_wants_B_score + B_wants_C_score + C_wants_A_score) / 3;
        if (overallChainScore > 65) { // Overall threshold for a good chain
          chains.push({
            chain: [A, B, C],
            scores: { A_wants_B: A_wants_B_score, B_wants_C: B_wants_C_score, C_wants_A: C_wants_A_score },
            overallChainScore,
            type: 'chain'
          });
        }
      }
    }
    return chains.sort((a, b) => b.overallChainScore - a.overallChainScore);
  }

  // Enhanced smart search with intent understanding
  async smartSearch(query, allListings, userContext = {}) {
    const searchResults = [];
    
    // First, understand the search intent
    const intentAnalysis = await this.analyzeSearchIntent(query);
    
    for (const listing of allListings) {
      const prompt = `Analyze this listing's relevance to the search query.

SEARCH QUERY: "${query}"
SEARCH INTENT: ${intentAnalysis.intent}
USER CONTEXT: ${JSON.stringify(userContext)}

LISTING:
Title: "${listing.title}"
Description: ${listing.description}
Category: ${listing.category}
Condition: ${listing.condition}
Wants: ${listing.want_item}
Location: ${listing.location}

Consider:
- Direct keyword matches
- Semantic similarity
- Category relevance
- Condition preferences
- Location proximity
- Value equivalence
- User's past preferences

Provide a relevance score (0-100) and brief reasoning.`;

      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Extract score from response
        const scoreMatch = text.match(/(\d+)/);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

        if (score > 30) {
          searchResults.push({ 
            listing, 
            score,
            reasoning: text,
            intent: intentAnalysis.intent
          });
        }
      } catch (error) {
        console.error(`Error during smart search for listing ${listing.id}:`, error);
      }
    }
    return searchResults.sort((a, b) => b.score - a.score);
  }

  // Analyze search intent
  async analyzeSearchIntent(query) {
    try {
      const prompt = `Analyze this search query and determine the user's intent.

QUERY: "${query}"

Classify the intent as one of:
- "specific_item" (looking for a specific item)
- "category_browse" (browsing a category)
- "price_range" (looking for items in a price range)
- "condition_preference" (specific condition requirement)
- "location_based" (location-specific search)
- "value_exchange" (looking for fair value exchange)
- "gift_idea" (looking for gift ideas)
- "hobby_related" (hobby-specific items)

Also extract:
- Main category
- Condition preference
- Price range (if mentioned)
- Location (if mentioned)
- Specific item names

Respond in JSON format.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch {
        return { intent: "general", category: "all" };
      }
    } catch (error) {
      console.error('Error analyzing search intent:', error);
      return { intent: "general", category: "all" };
    }
  }

  // AI-powered recommendation engine
  async getRecommendations(userId, userListings, allListings, limit = 10) {
    try {
      // Learn user preferences
      const userProfile = await this.buildUserProfile(userId, userListings);
      
      const recommendations = [];
      
      for (const listing of allListings) {
        if (listing.user_id === userId) continue; // Skip own listings
        
        const compatibilityScore = await this.calculateUserCompatibility(
          userProfile, 
          listing
        );
        
        if (compatibilityScore > 60) {
          recommendations.push({
            listing,
            score: compatibilityScore,
            reason: await this.generateRecommendationReason(userProfile, listing)
          });
        }
      }
      
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  // Build user profile from their listings and behavior
  async buildUserProfile(userId, userListings) {
    const categories = userListings.map(l => l.category);
    const conditions = userListings.map(l => l.condition);
    const locations = userListings.map(l => l.location);
    
    return {
      userId,
      preferredCategories: [...new Set(categories)],
      preferredConditions: [...new Set(conditions)],
      preferredLocations: [...new Set(locations)],
      totalListings: userListings.length,
      avgDesirability: await this.calculateAverageDesirability(userListings)
    };
  }

  // Calculate compatibility between user profile and listing
  async calculateUserCompatibility(userProfile, listing) {
    let score = 0;
    
    // Category preference
    if (userProfile.preferredCategories.includes(listing.category)) {
      score += 30;
    }
    
    // Condition preference
    if (userProfile.preferredConditions.includes(listing.condition)) {
      score += 20;
    }
    
    // Location preference
    if (userProfile.preferredLocations.includes(listing.location)) {
      score += 15;
    }
    
    // Desirability compatibility
    const desirabilityScore = await this.calculateDesirabilityCompatibility(
      userProfile.avgDesirability, 
      listing
    );
    score += desirabilityScore;
    
    return Math.min(score, 100);
  }

  // Calculate average desirability of user's listings
  async calculateAverageDesirability(listings) {
    try {
      const prompt = `Rate the average desirability of these items for bartering (0-100).

ITEMS:
${listings.map(l => `- ${l.title} (${l.condition})`).join('\n')}

Consider:
- How desirable these items are for trading
- Brand reputation and appeal
- Condition quality
- Rarity and uniqueness
- Practical utility
- Market demand

Provide only the average desirability score (0-100).`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return parseInt(text.trim()) || 50;
    } catch (error) {
      console.error('Error calculating desirability:', error);
      return 50;
    }
  }

  // Calculate desirability compatibility for bartering
  async calculateDesirabilityCompatibility(userAvgDesirability, listing) {
    try {
      const listingDesirability = await this.calculateItemDesirability(listing);
      const difference = Math.abs(userAvgDesirability - listingDesirability);
      const maxDifference = Math.max(userAvgDesirability, listingDesirability);
      
      // Lower difference = higher compatibility
      return Math.max(0, 35 - (difference / maxDifference) * 35);
    } catch (error) {
      return 15; // Default moderate compatibility
    }
  }

  // Calculate item desirability for bartering
  async calculateItemDesirability(listing) {
    try {
      const prompt = `Rate the desirability of this item for bartering (0-100).

ITEM: "${listing.title}"
Description: ${listing.description}
Category: ${listing.category}
Condition: ${listing.condition}

Consider:
- How desirable this item is for trading
- Brand reputation and appeal
- Condition quality
- Rarity and uniqueness
- Practical utility
- Market demand for similar items

Provide only the desirability score (0-100).`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return parseInt(text.trim()) || 50;
    } catch (error) {
      return 50;
    }
  }

  // Generate recommendation reason
  async generateRecommendationReason(userProfile, listing) {
    try {
      const prompt = `Generate a personalized recommendation reason for this listing.

USER PROFILE:
- Preferred Categories: ${userProfile.preferredCategories.join(', ')}
- Preferred Conditions: ${userProfile.preferredConditions.join(', ')}
- Preferred Locations: ${userProfile.preferredLocations.join(', ')}
- Average Desirability: ${userProfile.avgDesirability}/100

LISTING:
- Title: "${listing.title}"
- Category: ${listing.category}
- Condition: ${listing.condition}
- Location: ${listing.location}
- Wants: ${listing.want_item}

Generate a brief, personalized reason (1-2 sentences) why this user might be interested in this listing.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      return "This item matches your preferences!";
    }
  }

  // AI-powered category detection
  async detectCategory(title, description) {
    try {
      const prompt = `Classify this item into the most appropriate category.

TITLE: "${title}"
DESCRIPTION: ${description}

Choose from these categories:
- Elektronik
- Giyim
- Ev & Yaşam
- Spor & Outdoor
- Kitap & Dergi
- Hobi & Sanat
- Araç & Motosiklet
- Hizmet

Provide only the category name.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      return "Diğer";
    }
  }

  // AI-powered condition assessment
  async assessCondition(title, description, userClaimedCondition) {
    try {
      const prompt = `Assess the likely condition of this item based on description.

TITLE: "${title}"
DESCRIPTION: ${description}
USER CLAIMED CONDITION: ${userClaimedCondition}

Assess the actual condition as:
- new (brand new, never used)
- like_new (almost new, minimal use)
- excellent (very good condition, minor wear)
- good (good condition, some wear)
- fair (fair condition, noticeable wear)
- poor (poor condition, significant wear)

Consider the description details and provide the most likely condition.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      return userClaimedCondition;
    }
  }

  // AI-powered value equivalence (for bartering, not money)
  async calculateValueEquivalence(item1, item2) {
    try {
      const prompt = `Evaluate if these two items are equivalent in value for a fair barter trade.

ITEM 1: "${item1.title}"
Description: ${item1.description}
Category: ${item1.category}
Condition: ${item1.condition}

ITEM 2: "${item2.title}"
Description: ${item2.description}
Category: ${item2.category}
Condition: ${item2.condition}

Consider:
- Item rarity and demand
- Brand value and reputation
- Condition quality
- Practical utility
- Market desirability
- User preferences

Rate the equivalence from 0-100 (100 = perfectly equivalent for barter).
Provide only the numerical score.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return parseInt(text.trim()) || 50;
    } catch (error) {
      return 50; // Default moderate equivalence
    }
  }

  // AI-powered trade success prediction
  async predictTradeSuccess(listing1, listing2, user1Profile, user2Profile) {
    try {
      const prompt = `Predict the likelihood of a successful trade between these two users.

USER 1 LISTING: "${listing1.title}" (${listing1.category}, ${listing1.condition})
USER 1 PROFILE: ${JSON.stringify(user1Profile)}

USER 2 LISTING: "${listing2.title}" (${listing2.category}, ${listing2.condition})
USER 2 PROFILE: ${JSON.stringify(user2Profile)}

Consider:
- Item compatibility
- User preferences alignment
- Value equivalence
- Location proximity
- Past trading behavior
- Communication likelihood

Provide a success probability (0-100) and brief reasoning.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const scoreMatch = text.match(/(\d+)/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;
      
      return {
        probability: score,
        reasoning: text
      };
    } catch (error) {
      return { probability: 50, reasoning: "Unable to predict" };
    }
  }
}

module.exports = new AIMatchingService();