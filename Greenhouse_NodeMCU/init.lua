print('Starting an application')
appTimer= tmr.create()
appTimer:alarm(3000, tmr.ALARM_SINGLE, dofile('wifi_conf.lua'))

