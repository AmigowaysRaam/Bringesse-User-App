package com.app.bringessedeliveryuserapp;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import androidx.core.app.NotificationCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import io.invertase.firebase.common.ReactNativeFirebaseEventEmitter;
import io.invertase.firebase.messaging.ReactNativeFirebaseMessagingSerializer;

public class ReactNativeFirebaseMessagingService extends FirebaseMessagingService {

    private static final String CHANNEL_ID = "default";
    private static final String CHANNEL_NAME = "Default Channel";
    @Override
    public void onSendError(String messageId, Exception sendError) {
        ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
        emitter.sendEvent(
                ReactNativeFirebaseMessagingSerializer.messageSendErrorToEvent(messageId, sendError));
    }

    @Override
    public void onDeletedMessages() {
        ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
        emitter.sendEvent(ReactNativeFirebaseMessagingSerializer.messagesDeletedToEvent());
    }

    @Override
    public void onMessageSent(String messageId) {
        ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
        emitter.sendEvent(ReactNativeFirebaseMessagingSerializer.messageSentToEvent(messageId));
    }

    @Override
    public void onNewToken(String token) {
        ReactNativeFirebaseEventEmitter emitter = ReactNativeFirebaseEventEmitter.getSharedInstance();
        emitter.sendEvent(ReactNativeFirebaseMessagingSerializer.newTokenToTokenEvent(token));
    }

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        // noop - handled in receiver
        if (remoteMessage.getNotification() != null) {
            // Show a notification
            String title = remoteMessage.getNotification().getTitle();
            String body = remoteMessage.getNotification().getBody();
            sendNotification(title, body);
        }
    }

    private void sendNotification(String title, String messageBody) {

        Intent appIntent = new Intent(this, MainActivity.class);
        appIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);

        PendingIntent newPendingIntend = PendingIntent.getActivity(this, 0, appIntent, PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE);

        // Create the NotificationManager
        NotificationManager notificationManager =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

        // For Android 8.0 and above, create a notification channel
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    CHANNEL_NAME,
                    NotificationManager.IMPORTANCE_HIGH
            );
            notificationManager.createNotificationChannel(channel);
        }

        NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText(messageBody)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(newPendingIntend)
                .setVibrate(new long[]{1000, 1000});

        notificationManager.notify(0, notificationBuilder.build());
    }
}
