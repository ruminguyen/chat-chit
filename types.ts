

export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: string;
    avatar: string;
    imageUrl?: string;
    innerThought?: string;
    reactions?: { [key: string]: number };
    groundingSources?: { web: { uri: string; title: string; } }[];
    isHidden?: boolean;
}

export interface UserProfile {
    name: string;
    avatar: string;
}

export interface CharacterProfile {
    name: string;
    avatar: string;
}

export interface RelationshipStatus {
    score: number;
    level: string;
}

export interface Gift {
    name:string;
    description: string;
    imageUrl: string;
}

// Theme Types
export interface BubbleTheme {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
}

export interface ThemeSettings {
    userBubble: BubbleTheme;
    aiBubble: BubbleTheme;
}


// Phone App Types
export interface FoodItem {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
}

export interface Post {
    id: string;
    username: string;
    avatar: string;
    image: string;
    caption: string;
    timestamp: string;
    likes: number;
    comments: { user: string; text: string }[];
    song?: string;
}

export interface Conversation {
    id: string;
    contactName: string;
    lastMessage: string;
    timestamp: string;
    messages: { sender: string; text: string }[];
}

export interface Note {
    id: string;
    title: string;
    content: string;
}

export interface Transaction {
    id: string;
    type: 'income' | 'expense';
    description: string;
    amount: number;
    date: string;
}

export interface BankState {
    balance: number;
    currency: string;
    transactions: Transaction[];
}

export interface GoogleState {
    history: string[];
}

export interface YoutubeVideo {
    id: string;
    title: string;
    thumbnailUrl: string;
    channelName: string;
    views: string;
    uploaded: string;
}

export interface YoutubeState {
    videos: YoutubeVideo[];
}

// --- New App Types ---

export interface CallLogEntry {
    id: string;
    contactName: string;
    type: 'missed' | 'outgoing' | 'incoming';
    timestamp: string;
}

export interface CallLogState {
    entries: CallLogEntry[];
}

export interface UnderworldAsset {
    id: string;
    name: string;
    type: 'Safehouse' | 'Warehouse' | 'Front Business' | 'Data Center';
    location: string;
    status: 'Operational' | 'Compromised' | 'Under Surveillance';
}

export interface ElysianVaultState {
    assets: UnderworldAsset[];
}

export interface ExclusiveNewsArticle {
    id: string;
    headline: string;
    source: string;
    timestamp: string;
    content: string;
}

export interface ShadowNetState {
    articles: ExclusiveNewsArticle[];
}

export interface SecurityDevice {
    id: string;
    name: string;
    type: 'Camera' | 'Drone' | 'Sensor' | 'Turret';
    status: 'Online' | 'Offline' | 'Alert';
}

export interface CerberusState {
    devices: SecurityDevice[];
}


// Widget Types
export type WidgetType = 'clock' | 'weather' | 'calendar';

interface WidgetBase {
    id: string;
    type: WidgetType;
}

export interface ClockWidgetData extends WidgetBase {
    type: 'clock';
}

export interface WeatherWidgetData extends WidgetBase {
    type: 'weather';
    location: string;
    temperature: number;
    condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Stormy';
}

export interface CalendarEvent {
    time: string;
    title: string;
}

export interface CalendarWidgetData extends WidgetBase {
    type: 'calendar';
    events: CalendarEvent[];
}

export type Widget = ClockWidgetData | WeatherWidgetData | CalendarWidgetData;

export interface HomeScreenState {
    widgets: Widget[];
    appOrder: string[];
}


// Main Character State
export interface CharacterState {
    profile: CharacterProfile;
    bio: string;
    relationship: RelationshipStatus;
    apps: {
        instagram: { posts: Post[] };
        messages: { conversations: Conversation[] };
        notes: Note[];
        bank: BankState;
        google: GoogleState;
        youtube: YoutubeState;
        homeScreen: HomeScreenState;
        callLog: CallLogState;
        elysianVault: ElysianVaultState;
        shadowNet: ShadowNetState;
        cerberus: CerberusState;
    };
}

// Parsed AI Response
export interface ParsedResponse {
    response: string;
    relationshipChange?: number;
    innerThought?: string;
    gift?: Gift;
    action?: {
        // FIX: Added 'messages' to the app type to allow for messaging actions, resolving a type error.
        app: 'instagram' | 'bank' | 'notes' | 'google' | 'youtube' | 'homeScreen' | 'messages' | 'callLog' | 'elysianVault' | 'shadowNet' | 'cerberus';
        type: string;
        data: any;
    };
}

// Phone Update Patch Operation
export type PatchOperation = {
    op: 'add' | 'update' | 'remove';
    path: string;
    value?: any;
    id?: string;
};
