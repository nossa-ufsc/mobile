import WidgetKit
import SwiftUI

struct WidgetData: Decodable {
    let data: [Int: [CalendarEvent]]
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), events: [])
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
      let userDefaults = UserDefaults.init(suiteName: "group.nossa-ufsc.data")
      if userDefaults != nil {
          let entryDate = Date()
          if let savedData = userDefaults!.value(forKey: "subjects") as? String  {
              let decoder = JSONDecoder()
              if let parsedData = try? decoder.decode(WidgetData.self, from: savedData.data(using: .utf8)!) {
                  let calendar = Calendar.current
                  let currentDay = calendar.component(.weekday, from: entryDate) - 1
                  if let eventsForCurrentDay = parsedData.data[currentDay] {
                      let nextRefresh = Calendar.current.date(byAdding: .minute, value: 5, to: entryDate)!
                      let entry = SimpleEntry(date: nextRefresh, events: eventsForCurrentDay)
                      completion(entry)
                  } else {
                      let nextRefresh = Calendar.current.date(byAdding: .minute, value: 5, to: entryDate)!
                      let entry = SimpleEntry(date: nextRefresh, events: [])
                      completion(entry)
                  }
              } else {
                  print("Could not parse data")
              }
          } else {
              let nextRefresh = Calendar.current.date(byAdding: .minute, value: 5, to: entryDate)!
              let entry = SimpleEntry(date: nextRefresh, events: [])
              completion(entry)
          }
      }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
      let userDefaults = UserDefaults.init(suiteName: "group.nossa-ufsc.data")
      if userDefaults != nil {
          let entryDate = Date()
          if let savedData = userDefaults!.value(forKey: "subjects") as? String  {
              let decoder = JSONDecoder()
              if let parsedData = try? decoder.decode(WidgetData.self, from: savedData.data(using: .utf8)!) {
                  let calendar = Calendar.current
                  let currentDay = calendar.component(.weekday, from: entryDate) - 1
                  let nextRefresh = Calendar.current.date(byAdding: .minute, value: 5, to: entryDate)!
                  if let eventsForCurrentDay = parsedData.data[currentDay] {
                      let entry = SimpleEntry(date: nextRefresh, events: eventsForCurrentDay)
                      let timeline = Timeline(entries: [entry], policy: .atEnd)
                      completion(timeline)
                  } else {
                      let entry = SimpleEntry(date: nextRefresh, events: [])
                      let timeline = Timeline(entries: [entry], policy: .atEnd)
                      completion(timeline)                  }
              } else {
                  print("Could not parse data")
              }
          } else {
              let nextRefresh = Calendar.current.date(byAdding: .minute, value: 5, to: entryDate)!
              let entry = SimpleEntry(date: nextRefresh, events: [])
              let timeline = Timeline(entries: [entry], policy: .atEnd)
              completion(timeline)
          }
      }
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let events: [CalendarEvent]
}

struct CalendarEvent: Decodable {
    let name: String
    let classroom: String
    let time: String
    let finishTime: String
}


struct CalendarWidgetEntryView : View {
    var entry: Provider.Entry
  
    var currentHour: Int {
          let calendar = Calendar.current
          let hour = calendar.component(.hour, from: entry.date)
          return hour
      }
      
    var filteredEvents: [CalendarEvent] {
      return entry.events.filter { event in
            guard let eventHour = Int(event.finishTime.split(separator: ":")[0]) else {
                return false
            }
            return eventHour >= currentHour
        }.sorted(by: { $0.time < $1.time })
    }

    var body: some View {
      HStack {
            VStack(alignment: .leading) {
                Text(entry.date, formatter: DateFormatter.weekdayAbbreviationFormatter)
                  .font(.headline)
                  .environment(\.locale, Locale(identifier: "pt-BR"))
                Text(entry.date, formatter: DateFormatter.dayFormatter)
                  .font(.title)
                  .environment(\.locale, Locale(identifier: "pt-BR"))
            }
            .padding(.leading, 24.0)

            
          VStack(alignment: .leading, spacing: 10) {
            if filteredEvents.isEmpty {
                  Text("Nenhuma aula hoje.")
                      .font(.subheadline)
                      .padding()
              } else {
                LazyVStack(spacing: 0) {
                    ForEach(0..<min(filteredEvents.count, 3), id: \.self) { index in
                      VStack(alignment: .leading, spacing: 2.0) {
                            Text(filteredEvents[index].name)
                                .font(.subheadline)
                                .bold()
                                .lineLimit(1)
                                .truncationMode(.tail)
                            Text("\(filteredEvents[index].time) - \(filteredEvents[index].finishTime) em \(filteredEvents[index].classroom)")
                                .font(.caption)
                        }
                        .padding(.bottom, 4)
                        .padding(.top, 2)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        if index < min(filteredEvents.count, 3) - 1 {
                            Divider()
                                .background(Color.gray)
                                .padding(3)
                        }
                    }
                }
              }
            }
          .padding()
        }.frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct CalendarWidget: Widget {
    let kind: String = "CalendarWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            CalendarWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Calendário")
        .description("Acompanhe sua grade de horários.")
        .supportedFamilies([.systemMedium])
    }
}

struct CalendarWidget_Previews: PreviewProvider {
    static var previews: some View {
      CalendarWidgetEntryView(entry: SimpleEntry(date: Date(), events: [
        CalendarEvent(name: "Tecnologia da edificação IV sds", classroom: "ARQ-323", time: "07:30", finishTime: "09:10"),
        CalendarEvent(name: "Urbanismo e Paisagismo III", classroom: "ARQ-203", time: "09:10", finishTime: "11:00"),
        CalendarEvent(name: "Historia da Cidade I", classroom: "ARQ-301", time: "15:10", finishTime: "18:00")
      ]))
        .previewContext(WidgetPreviewContext(family: .systemMedium))
    }
}

extension DateFormatter {
    static let weekdayAbbreviationFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "E"
        return formatter
    }()
    
    static let dayFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "d"
        return formatter
    }()
}
