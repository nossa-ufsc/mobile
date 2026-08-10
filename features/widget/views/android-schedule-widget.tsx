import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { timeToMinutes } from '@/utils/time-mapping';
import { i18n } from '@/utils/i18n';
import { getDateLocale } from '@/utils/i18n/get-date-locale';

interface WidgetEvent {
  name: string;
  classroom: string;
  startTime: string;
  endTime: string;
}

interface AndroidScheduleWidgetProps {
  classes: WidgetEvent[];
  currentDate: Date;
}

export function AndroidScheduleWidget({ classes, currentDate }: AndroidScheduleWidgetProps) {
  const weekday = new Intl.DateTimeFormat(getDateLocale(), { weekday: 'short' }).format(
    currentDate
  );
  const day = new Intl.DateTimeFormat(getDateLocale(), { day: 'numeric' }).format(currentDate);

  const currentHour = currentDate.getHours();
  const filteredEvents = classes
    .filter((event) => {
      const eventHour = parseInt(event.endTime.split(':')[0], 10);
      return eventHour >= currentHour;
    })
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
    .slice(0, 3);

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <FlexWidget
        style={{
          flexDirection: 'row',
          width: 'match_parent',
          alignItems: 'center',
        }}>
        <FlexWidget
          style={{
            paddingLeft: 8,
          }}>
          <TextWidget
            text={weekday.toUpperCase()}
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#000000',
            }}
          />
          <TextWidget
            text={day}
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#000000',
            }}
          />
        </FlexWidget>

        <FlexWidget
          style={{
            flex: 1,
            marginLeft: 16,
          }}>
          {filteredEvents.length === 0 ? (
            <TextWidget
              text={i18n.t('widget.noClasses')}
              style={{
                fontSize: 14,
                color: '#000000',
                padding: 16,
              }}
            />
          ) : (
            filteredEvents.map((event, index) => (
              <FlexWidget
                key={`${event.name}-${event.startTime}`}
                style={{
                  width: 'match_parent',
                  paddingVertical: 8,
                  borderBottomWidth: index < filteredEvents.length - 1 ? 1 : 0,
                  borderBottomColor: '#E0E0E0',
                }}>
                <TextWidget
                  text={event.name}
                  style={{
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: '#000000',
                  }}
                />
                <TextWidget
                  text={
                    event.classroom
                      ? i18n.t('widget.classTime', {
                          start: event.startTime,
                          end: event.endTime,
                          classroom: event.classroom,
                        })
                      : i18n.t('widget.classTimeNoRoom', {
                          start: event.startTime,
                          end: event.endTime,
                        })
                  }
                  style={{
                    fontSize: 12,
                    color: '#666666',
                    marginTop: 2,
                  }}
                />
              </FlexWidget>
            ))
          )}
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
