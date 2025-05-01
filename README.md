# Nossa UFSC

## Widget Integration

The app includes a widget feature that displays the user's class schedule for the current day. This integration is built using [expo-apple-targets](https://github.com/EvanBacon/expo-apple-targets), which enables Continuous Native Generation for iOS targets like widgets.

### How it works

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

### Development

The widget code lives in the `targets/widget` directory and is managed outside the main iOS project directory. This setup allows for:

- Independent widget development without affecting the main app code
- Version control of widget code separate from generated iOS files
- Seamless integration with Expo's build process

To modify the widget:

1. Edit files in `targets/widget`
2. Run `npx expo prebuild -p ios` to regenerate native code
3. Open Xcode to test the widget in the simulator

For more details on the widget implementation and expo-apple-targets, check out the [official documentation](https://github.com/EvanBacon/expo-apple-targets#-how-to-use).
