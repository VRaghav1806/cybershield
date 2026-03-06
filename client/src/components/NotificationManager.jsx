import React, { useEffect, useRef } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const API_BASE = 'http://localhost:5000/api';

const NotificationManager = () => {
    const { addToast } = useToast();
    const lastAlertId = useRef(null);

    useEffect(() => {
        const checkForNewAlerts = async () => {
            // Check if notifications are enabled in local storage
            const settingsStr = localStorage.getItem('cybershield_settings');
            const settings = settingsStr ? JSON.parse(settingsStr) : { notifications: true };

            if (!settings.notifications) return;

            try {
                // We only need the latest 1 alert to see if something new happened
                const res = await axios.get(`${API_BASE}/threats/alerts`);
                const alerts = res.data;

                if (alerts && alerts.length > 0) {
                    const latestAlert = alerts[0];

                    // If we have a new alert that we haven't seen yet
                    if (lastAlertId.current && latestAlert._id !== lastAlertId.current) {

                        // Only notify for actual threats, or perhaps all? Let's notify for threats
                        if (latestAlert.type === 'Phishing') {
                            addToast(
                                'Critical Threat Blocked!',
                                `A ${latestAlert.severity.toLowerCase()} severity phishing attempt was just intercepted.`,
                                'danger'
                            );
                        } else {
                            addToast(
                                'Scan Completed',
                                `Activity logged as Safe. System secure.`,
                                'info'
                            );
                        }
                    }

                    // Update the ref to the latest seen alert
                    lastAlertId.current = latestAlert._id;
                }
            } catch (err) {
                console.error('Error polling for notifications:', err);
            }
        };

        // Poll every 3 seconds for immediate real-time feel
        const interval = setInterval(checkForNewAlerts, 3000);

        // Initial fetch to set the baseline ID without notifying
        axios.get(`${API_BASE}/threats/alerts`).then(res => {
            if (res.data && res.data.length > 0) {
                lastAlertId.current = res.data[0]._id;
            }
        }).catch(err => console.error(err));

        return () => clearInterval(interval);
    }, [addToast]);

    return null; // This is a logic-only component, renders nothing
};

export default NotificationManager;
