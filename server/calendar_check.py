from datetime import date
start = date(2026,7,14)
end = date(2026,7,29)
d = start
while d <= end:
    print(d.strftime("%d %b %Y") + " = " + d.strftime("%A"))
    d = date.fromordinal(d.toordinal()+1)
