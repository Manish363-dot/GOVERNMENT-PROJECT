import type { RouteReplayDataset, ReplayPoint, CollectionPoint, ReplayStop, RouteDeviation, WardBoundary, ReplayEvent, RoutePerformance } from '@/types/routeReplay';
import { format, parseISO, addMinutes } from 'date-fns';

/**
 * Clean Demo / Mock Data Generator for Route Replay.
 * Used when real backend GPS transmissions are not available for the selected range.
 */
export function generateMockRouteReplayData(
    vehicleId: string,
    vehicleNumber: string,
    vehicleName: string,
    dateStr: string,
    startTimeStr: string = '06:00',
    endTimeStr: string = '12:00'
): RouteReplayDataset {
    const baseDate = dateStr || format(new Date(), 'yyyy-MM-dd');

    // Parse start & end times into Date objects
    const startDateTime = new Date(`${baseDate}T${startTimeStr}:00`);
    const endDateTime = new Date(`${baseDate}T${endTimeStr}:00`);

    // Ward Boundaries in Almora / District Region
    const wardBoundaries: WardBoundary[] = [
        {
            id: 'ward-1',
            wardName: 'Ward 01 - Almora North & Dharanaula',
            wardNumber: 1,
            color: '#3b82f6', // blue
            coordinates: [
                [29.595, 79.642],
                [29.605, 79.648],
                [29.608, 79.660],
                [29.598, 79.658],
                [29.595, 79.642]
            ]
        },
        {
            id: 'ward-2',
            wardName: 'Ward 02 - Mall Road Central Hub',
            wardNumber: 2,
            color: '#10b981', // green
            coordinates: [
                [29.588, 79.645],
                [29.595, 79.642],
                [29.598, 79.658],
                [29.590, 79.656],
                [29.588, 79.645]
            ]
        },
        {
            id: 'ward-3',
            wardName: 'Ward 03 - Nanda Devi & Market Zone',
            wardNumber: 3,
            color: '#f59e0b', // amber
            coordinates: [
                [29.585, 79.650],
                [29.590, 79.656],
                [29.594, 79.668],
                [29.582, 79.664],
                [29.585, 79.650]
            ]
        },
        {
            id: 'ward-4',
            wardName: 'Ward 04 - Cantonment South & Link Rd',
            wardNumber: 4,
            color: '#8b5cf6', // purple
            coordinates: [
                [29.578, 79.640],
                [29.588, 79.645],
                [29.585, 79.650],
                [29.576, 79.648],
                [29.578, 79.640]
            ]
        }
    ];

    // Base waypoint trajectory (Almora route corridor)
    const waypointTemplates = [
        { lat: 29.5800, lng: 79.6410, location: 'Garbage Depot & Central Yard', ward: 'Ward 04 - Cantonment South', speed: 0, status: 'idle' as const },
        { lat: 29.5815, lng: 79.6422, location: 'Cantonment Main Road', ward: 'Ward 04 - Cantonment South', speed: 18, status: 'moving' as const },
        { lat: 29.5835, lng: 79.6438, location: 'Link Road Junction', ward: 'Ward 04 - Cantonment South', speed: 22, status: 'moving' as const },
        { lat: 29.5855, lng: 79.6455, location: 'Lower Mall Road Bin #101', ward: 'Ward 02 - Mall Road Central Hub', speed: 0, status: 'collection' as const, colId: 'col-1', colName: 'Bin #101 - Lower Mall Gate' },
        { lat: 29.5872, lng: 79.6470, location: 'Mall Road Promenade', ward: 'Ward 02 - Mall Road Central Hub', speed: 24, status: 'moving' as const },
        { lat: 29.5888, lng: 79.6488, location: 'Post Office Chowk Bin #102', ward: 'Ward 02 - Mall Road Central Hub', speed: 0, status: 'collection' as const, colId: 'col-2', colName: 'Bin #102 - Post Office Chowk' },
        { lat: 29.5902, lng: 79.6505, location: 'Kumaon Mandal Complex', ward: 'Ward 02 - Mall Road Central Hub', speed: 15, status: 'moving' as const },
        { lat: 29.5915, lng: 79.6520, location: 'District Hospital Gate Bin #103', ward: 'Ward 02 - Mall Road Central Hub', speed: 0, status: 'collection' as const, colId: 'col-3', colName: 'Bin #103 - District Hospital Gate' },
        { lat: 29.5930, lng: 79.6538, location: 'Traffic Intersection', ward: 'Ward 01 - Almora North', speed: 0, status: 'stopped' as const, stopType: 'traffic', stopDesc: 'Short Traffic Signal Halt (3 mins)' },
        { lat: 29.5948, lng: 79.6552, location: 'Shikhar Hotel Chowk', ward: 'Ward 01 - Almora North', speed: 19, status: 'moving' as const },
        { lat: 29.5965, lng: 79.6568, location: 'Nanda Devi Temple Entrance Bin #104', ward: 'Ward 03 - Nanda Devi & Market Zone', speed: 0, status: 'collection' as const, colId: 'col-4', colName: 'Bin #104 - Nanda Devi Shrine Square' },
        { lat: 29.5982, lng: 79.6585, location: 'Lala Bazaar Commercial Alley', ward: 'Ward 03 - Nanda Devi & Market Zone', speed: 12, status: 'moving' as const },
        { lat: 29.5998, lng: 79.6602, location: 'Paltan Bazaar Bin #105', ward: 'Ward 03 - Nanda Devi & Market Zone', speed: 0, status: 'collection' as const, colId: 'col-5', colName: 'Bin #105 - Paltan Market Sector B' },
        { lat: 29.6015, lng: 79.6620, location: 'Unexpected Vehicle Halt Area', ward: 'Ward 03 - Nanda Devi & Market Zone', speed: 0, status: 'stopped' as const, stopType: 'unexpected', stopDesc: 'Prolonged Unscheduled Stop (14 mins) — Vehicle Idle' },
        { lat: 29.6030, lng: 79.6640, location: 'Dharanaula Bypass Road', ward: 'Ward 01 - Almora North', speed: 28, status: 'moving' as const },
        // Route deviation points
        { lat: 29.6055, lng: 79.6675, location: 'Unassigned Alley Detour (Off-Route)', ward: 'Ward 01 - Almora North', speed: 16, status: 'deviation' as const, devReason: 'Unauthorized 550m Detour off primary cleaning route' },
        { lat: 29.6070, lng: 79.6698, location: 'Private Commercial Yard', ward: 'Ward 01 - Almora North', speed: 0, status: 'deviation' as const, devReason: 'Off-route stationary stop' },
        { lat: 29.6042, lng: 79.6655, location: 'Re-entering Main Transit Route', ward: 'Ward 01 - Almora North', speed: 25, status: 'moving' as const },
        { lat: 29.6020, lng: 79.6610, location: 'Dharanaula Sanitation Hub Bin #106', ward: 'Ward 01 - Almora North', speed: 0, status: 'collection' as const, colId: 'col-6', colName: 'Bin #106 - Dharanaula Transfer Station' },
        { lat: 29.5975, lng: 79.6550, location: 'Lower Bypass Highway', ward: 'Ward 02 - Mall Road Central Hub', speed: 32, status: 'moving' as const },
        { lat: 29.5920, lng: 79.6490, location: 'Cantonment Return Expressway', ward: 'Ward 04 - Cantonment South', speed: 26, status: 'moving' as const },
        { lat: 29.5805, lng: 79.6412, location: 'District Solid Waste Processing Plant', ward: 'Ward 04 - Cantonment South', speed: 0, status: 'idle' as const }
    ];

    // Interpolate intermediate points for smooth animation (total ~60 points)
    const points: ReplayPoint[] = [];
    const totalSteps = waypointTemplates.length;
    const timeSpanMinutes = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60); // e.g. 360 mins
    const minutesPerStep = Math.max(1, Math.floor(timeSpanMinutes / (totalSteps * 3)));

    let pointIndex = 0;
    let currTime = new Date(startDateTime.getTime());

    for (let i = 0; i < waypointTemplates.length; i++) {
        const p1 = waypointTemplates[i];
        const p2 = waypointTemplates[i + 1] || p1;

        // Sub-steps between p1 and p2
        const subSteps = p1.status === 'stopped' ? 4 : p1.status === 'collection' ? 3 : 2;

        for (let s = 0; s < subSteps; s++) {
            const ratio = s / subSteps;
            const lat = p1.lat + (p2.lat - p1.lat) * ratio;
            const lng = p1.lng + (p2.lng - p1.lng) * ratio;

            // Calculate heading direction
            const dLng = p2.lng - p1.lng;
            const dLat = p2.lat - p1.lat;
            const heading = (Math.atan2(dLng, dLat) * (180 / Math.PI) + 360) % 360;

            const timeStr = format(currTime, 'hh:mm:ss a');
            const timeMinutes = currTime.getHours() * 60 + currTime.getMinutes();

            let colStatus: ReplayPoint['collectionStatus'] = 'N/A';
            if (p1.colId) {
                colStatus = 'Completed';
            }

            points.push({
                id: `pt-${pointIndex + 1}`,
                index: pointIndex,
                timestamp: currTime.toISOString(),
                timeStr,
                timeMinutes,
                latitude: Math.round(lat * 100000) / 100000,
                longitude: Math.round(lng * 100000) / 100000,
                speed: s === 0 ? p1.speed : Math.max(0, Math.round((p1.speed + (p2.speed - p1.speed) * ratio))),
                heading: Math.round(heading),
                status: p1.status,
                locationName: p1.location,
                wardName: p1.ward,
                collectionPointId: p1.colId,
                collectionStatus: colStatus,
                collectionName: p1.colName
            });

            pointIndex++;
            currTime = addMinutes(currTime, minutesPerStep);
        }
    }

    // Defined Collection Points
    const collectionPoints: CollectionPoint[] = [
        { id: 'col-1', name: 'Bin #101 - Lower Mall Gate', wardName: 'Ward 02 - Mall Road Central Hub', latitude: 29.5855, longitude: 79.6455, scheduledTime: '06:30 AM', completedTime: '06:32 AM', status: 'Completed', targetBinsCount: 2 },
        { id: 'col-2', name: 'Bin #102 - Post Office Chowk', wardName: 'Ward 02 - Mall Road Central Hub', latitude: 29.5888, longitude: 79.6488, scheduledTime: '07:10 AM', completedTime: '07:14 AM', status: 'Completed', targetBinsCount: 3 },
        { id: 'col-3', name: 'Bin #103 - District Hospital Gate', wardName: 'Ward 02 - Mall Road Central Hub', latitude: 29.5915, longitude: 79.6520, scheduledTime: '07:45 AM', completedTime: '07:50 AM', status: 'Completed', targetBinsCount: 4 },
        { id: 'col-4', name: 'Bin #104 - Nanda Devi Shrine Square', wardName: 'Ward 03 - Nanda Devi & Market Zone', latitude: 29.5965, longitude: 79.6568, scheduledTime: '08:30 AM', completedTime: '08:34 AM', status: 'Completed', targetBinsCount: 5 },
        { id: 'col-5', name: 'Bin #105 - Paltan Market Sector B', wardName: 'Ward 03 - Nanda Devi & Market Zone', latitude: 29.5998, longitude: 79.6602, scheduledTime: '09:05 AM', completedTime: '09:08 AM', status: 'Completed', targetBinsCount: 3 },
        { id: 'col-6', name: 'Bin #106 - Dharanaula Transfer Station', wardName: 'Ward 01 - Almora North', latitude: 29.6020, longitude: 79.6610, scheduledTime: '10:45 AM', completedTime: '10:50 AM', status: 'Completed', targetBinsCount: 6 },
        { id: 'col-7', name: 'Bin #107 - Upper Cantonment School Bin', wardName: 'Ward 04 - Cantonment South', latitude: 29.5790, longitude: 79.6430, scheduledTime: '11:30 AM', status: 'Missed', targetBinsCount: 2 }
    ];

    // Defined Vehicle Stops
    const stops: ReplayStop[] = [
        {
            id: 'stop-1',
            latitude: 29.5930,
            longitude: 79.6538,
            locationName: 'Shikhar Hotel Traffic Signal',
            wardName: 'Ward 01 - Almora North',
            startTime: '08:05 AM',
            endTime: '08:08 AM',
            durationMinutes: 3,
            type: 'traffic',
            description: 'Routine Traffic Halt'
        },
        {
            id: 'stop-2',
            latitude: 29.6015,
            longitude: 79.6620,
            locationName: 'Paltan Bazaar Rear Alley',
            wardName: 'Ward 03 - Nanda Devi & Market Zone',
            startTime: '09:20 AM',
            endTime: '09:34 AM',
            durationMinutes: 14,
            type: 'unexpected',
            description: '🔴 Prolonged Unscheduled Stop (14 min) - Ignition On'
        }
    ];

    // Defined Route Deviation
    const deviations: RouteDeviation[] = [
        {
            id: 'dev-1',
            startTime: '09:55 AM',
            endTime: '10:20 AM',
            locationName: 'Dharanaula Unassigned Alley Detour',
            wardName: 'Ward 01 - Almora North',
            distanceOffKm: 0.55,
            reason: '🔵 Off Primary Cleaning Corridor by 550m',
            points: [
                [29.6030, 79.6640],
                [29.6055, 79.6675],
                [29.6070, 79.6698],
                [29.6042, 79.6655]
            ]
        }
    ];

    // Timeline Events
    const events: ReplayEvent[] = [
        { id: 'ev-1', type: 'collection', timestamp: points[6]?.timestamp || startDateTime.toISOString(), timeStr: '06:32 AM', pointIndex: 6, latitude: 29.5855, longitude: 79.6455, title: '🟢 Collection Completed', description: 'Bin #101 - Lower Mall Gate (2 Bins emptied)', wardName: 'Ward 02 - Mall Road Central Hub', speed: 0 },
        { id: 'ev-2', type: 'collection', timestamp: points[12]?.timestamp || startDateTime.toISOString(), timeStr: '07:14 AM', pointIndex: 12, latitude: 29.5888, longitude: 79.6488, title: '🟢 Collection Completed', description: 'Bin #102 - Post Office Chowk (3 Bins emptied)', wardName: 'Ward 02 - Mall Road Central Hub', speed: 0 },
        { id: 'ev-3', type: 'collection', timestamp: points[16]?.timestamp || startDateTime.toISOString(), timeStr: '07:50 AM', pointIndex: 16, latitude: 29.5915, longitude: 79.6520, title: '🟢 Collection Completed', description: 'Bin #103 - District Hospital Gate (4 Bins emptied)', wardName: 'Ward 02 - Mall Road Central Hub', speed: 0 },
        { id: 'ev-4', type: 'stop', timestamp: points[18]?.timestamp || startDateTime.toISOString(), timeStr: '08:05 AM', pointIndex: 18, latitude: 29.5930, longitude: 79.6538, title: '🟡 Vehicle Stopped', description: 'Routine Traffic Intersection Halt (3 mins)', wardName: 'Ward 01 - Almora North', speed: 0 },
        { id: 'ev-5', type: 'collection', timestamp: points[22]?.timestamp || startDateTime.toISOString(), timeStr: '08:34 AM', pointIndex: 22, latitude: 29.5965, longitude: 79.6568, title: '🟢 Collection Completed', description: 'Bin #104 - Nanda Devi Shrine Square (5 Bins emptied)', wardName: 'Ward 03 - Nanda Devi & Market Zone', speed: 0 },
        { id: 'ev-6', type: 'unexpected_stop', timestamp: points[27]?.timestamp || startDateTime.toISOString(), timeStr: '09:20 AM', pointIndex: 27, latitude: 29.6015, longitude: 79.6620, title: '🔴 Unexpected Stop Alert', description: 'Prolonged Unscheduled Stop (14 min) near Paltan Alley', wardName: 'Ward 03 - Nanda Devi & Market Zone', speed: 0 },
        { id: 'ev-7', type: 'deviation', timestamp: points[32]?.timestamp || startDateTime.toISOString(), timeStr: '09:55 AM', pointIndex: 32, latitude: 29.6055, longitude: 79.6675, title: '🔵 Route Deviation Alert', description: 'Vehicle departed 550m off designated Master Route', wardName: 'Ward 01 - Almora North', speed: 16 },
        { id: 'ev-8', type: 'collection', timestamp: points[42]?.timestamp || startDateTime.toISOString(), timeStr: '10:50 AM', pointIndex: 42, latitude: 29.6020, longitude: 79.6610, title: '🟢 Collection Completed', description: 'Bin #106 - Dharanaula Waste Transfer Hub', wardName: 'Ward 01 - Almora North', speed: 0 }
    ];

    // Route Performance Summary
    const performance: RoutePerformance = {
        totalDistanceKm: 26.4,
        activeDrivingTimeStr: '4h 18m',
        totalStopsCount: 7,
        collectionPointsVisited: 6,
        totalCollectionPoints: 7,
        missedCollectionPoints: 1,
        routeDeviationsCount: 1,
        averageSpeedKmH: 21.5
    };

    return {
        vehicleId,
        vehicleNumber,
        vehicleName: vehicleName || 'Garbage Pickup Truck',
        date: baseDate,
        startTime: startTimeStr,
        endTime: endTimeStr,
        isDemoData: true,
        points,
        collectionPoints,
        stops,
        deviations,
        wardBoundaries,
        events,
        performance
    };
}
