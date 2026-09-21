// ============================================================
// TypeScript Definitions for Route Replay & Telematics
// ============================================================

export type ReplayPointStatus = 'moving' | 'idle' | 'stopped' | 'collection' | 'deviation';

export interface ReplayPoint {
    id: string;
    index: number;
    timestamp: string; // ISO string
    timeStr: string; // e.g. "06:15:30 AM"
    timeMinutes: number; // minutes from midnight for easy slider calculations
    latitude: number;
    longitude: number;
    speed: number; // in km/h
    heading: number; // degrees 0-360
    status: ReplayPointStatus;
    locationName: string;
    wardName: string;
    collectionPointId?: string;
    collectionStatus?: 'Completed' | 'Pending' | 'Missed' | 'N/A';
    collectionName?: string;
}

export interface CollectionPoint {
    id: string;
    name: string;
    wardName: string;
    latitude: number;
    longitude: number;
    scheduledTime: string;
    completedTime?: string;
    status: 'Completed' | 'Missed' | 'Pending';
    targetBinsCount: number;
}

export interface ReplayStop {
    id: string;
    latitude: number;
    longitude: number;
    locationName: string;
    wardName: string;
    startTime: string; // ISO or HH:mm
    endTime: string;
    durationMinutes: number;
    type: 'idle' | 'traffic' | 'unexpected';
    description: string;
}

export interface RouteDeviation {
    id: string;
    startTime: string;
    endTime: string;
    points: [number, number][];
    distanceOffKm: number;
    locationName: string;
    wardName: string;
    reason: string;
}

export interface WardBoundary {
    id: string;
    wardName: string;
    wardNumber: number;
    color: string;
    coordinates: [number, number][];
}

export type ReplayEventType = 'collection' | 'stop' | 'unexpected_stop' | 'deviation';

export interface ReplayEvent {
    id: string;
    type: ReplayEventType;
    timestamp: string;
    timeStr: string;
    pointIndex: number;
    latitude: number;
    longitude: number;
    title: string;
    description: string;
    wardName: string;
    speed?: number;
}

export interface RoutePerformance {
    totalDistanceKm: number;
    activeDrivingTimeStr: string;
    totalStopsCount: number;
    collectionPointsVisited: number;
    totalCollectionPoints: number;
    missedCollectionPoints: number;
    routeDeviationsCount: number;
    averageSpeedKmH: number;
}

export interface RouteReplayDataset {
    vehicleId: string;
    vehicleNumber: string;
    vehicleName: string;
    date: string;
    startTime: string;
    endTime: string;
    isDemoData: boolean;
    points: ReplayPoint[];
    collectionPoints: CollectionPoint[];
    stops: ReplayStop[];
    deviations: RouteDeviation[];
    wardBoundaries: WardBoundary[];
    events: ReplayEvent[];
    performance: RoutePerformance;
}
