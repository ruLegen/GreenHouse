do
    wifi.setmode(wifi.STATION)
    wifi.sta.clearconfig()
    local scfg = {}
    scfg.auto = true
    scfg.save = true
    scfg.ssid = 'AC_DC' -- WiFi
    scfg.pwd = '' -- Password
    wifi.sta.config(scfg)
    wifi.sta.connect()
    tmr.create():alarm(15000, tmr.ALARM_SINGLE, function() print('\n', wifi.sta.getip()) end)
end