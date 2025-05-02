# Nossa UFSC

## Widget Integration

The app includes widget features for both iOS and Android that display the user's class schedule for the current day.

### iOS Widget

The iOS widget integration is built using [expo-apple-targets](https://github.com/EvanBacon/expo-apple-targets), which enables Continuous Native Generation for iOS targets like widgets.

#### How it works

1. **Data Sharing**: The app shares schedule data with the widget through a shared App Group using `ExtensionStorage`. This data is automatically synced whenever the schedule is updated in the main app.

2. **Data Format**: The schedule data is converted to a widget-friendly format using a dedicated adapter (`utils/subjects-to-widget-adapter.ts`). The structure looks like this:

```typescript
interface WidgetData {
  data: {
    [weekDay: number]: Array<{
      name: string; // Subject name
      classroom: string; // Room number
      time: string; // Start time
      finishTime: string; // End time
    }>;
  };
}
```

3. **Widget Implementation**: The widget (`targets/widget/widgets.swift`) reads this data and displays the current day's schedule. It:
   - Refreshes every 5 minutes
   - Shows up to 3 upcoming classes for the day
   - Displays class name, room, and time information
   - Automatically updates when the app modifies the schedule

### Android Widget

The Android widget is implemented using [react-native-android-widget](https://github.com/awesomejerry/react-native-android-widget), which allows creating native Android widgets using React Native components.

#### How it works

1. **Widget Configuration**: The widget is configured in `app.json`.

2. **Implementation**: The widget is implemented using two main components:

   - `widget-task-handler.tsx`: Manages the widget's data and lifecycle
   - `android-schedule-widget.tsx`: Handles the widget's UI rendering

### Development

#### iOS Widget Development

The widget code lives in the `targets/widget` directory and is managed outside the main iOS project directory. This setup allows for:

- Independent widget development without affecting the main app code
- Version control of widget code separate from generated iOS files
- Seamless integration with Expo's build process

To modify the iOS widget:

1. Edit files in `targets/widget`
2. Run `npx expo prebuild -p ios` to regenerate native code
3. Open Xcode to test the widget in the simulator

#### Android Widget Development

The Android widget code is located in the `features/widget` directory. To modify the Android widget:

1. Edit the widget components in `features/widget`
2. Update widget configuration in `app.json` if needed
3. Rebuild and deploy the app to test changes

For more details on the implementations:

- iOS Widget: Check out the [expo-apple-targets documentation](https://github.com/EvanBacon/expo-apple-targets#-how-to-use)
- Android Widget: Refer to the [react-native-android-widget documentation](https://github.com/awesomejerry/react-native-android-widget)
