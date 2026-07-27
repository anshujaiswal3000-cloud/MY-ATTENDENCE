# AttendX

A premium, local-first personal attendance tracker built with React 18, Vite, Material UI, Framer Motion, and Recharts.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview
```

## Notes

- All data (subjects, attendance counters, history log, settings, theme) is stored **only** in your browser's `localStorage`. Nothing leaves your device.
- Use **Settings → Export Data** to download a JSON backup, or **Backup Local Storage** to snapshot inside the browser (with a matching **Restore Backup**).
- Add lecture time slots to a subject (via Add/Edit Subject → Timetable) so it appears under **Today's Classes** on the Dashboard and in the **Timetable** page.
- The **Can I Bunk?** calculator on the Analytics page tells you, for a chosen subject and target percentage (75/80/85/90%), how many classes you can still miss — or how many you need to attend next — to hit that target.
