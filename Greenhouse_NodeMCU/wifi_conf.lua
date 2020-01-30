do
    RELAY_OFF = 1
    RELAY_ON = 0
    netAvailable = false
    state = {
        relay1= RELAY_OFF,
        relay2= RELAY_OFF,
        relay3= RELAY_OFF,
        relay4= RELAY_OFF,
        duration=3600000,
        schedule = "0 6 * * *"  -- minutes hour days month week_day
    }

    rtctime.set(0)
    gpio.mode(1, gpio.OUTPUT)
    gpio.mode(2, gpio.OUTPUT)
    gpio.mode(3, gpio.OUTPUT)
    gpio.mode(4, gpio.OUTPUT)
    gpio.write(1, state.relay1)
    gpio.write(2, state.relay2)
    gpio.write(3, state.relay3)
    gpio.write(4, state.relay4)

    url = "ws://greenhouse.openode.io/"
    url = "ws://192.168.10.180:8000"
    ws = websocket.createClient()
    ws:config({headers={['User-Agent']='NodeMCU'}})


   function createSchedule ()
        print("Minute gone", rtctime.get(),e)
        print("Turning  on the relay")
        state.relay1 = RELAY_ON
        gpio.write(1, gpio.LOW)
        pcall(function() ws:send(sjson.encode(createMessage("state-update",state))) end)
        tmr.create():alarm(state.duration,tmr.ALARM_SINGLE,function() 
            print("Turn off the relay")
            gpio.write(1, gpio.HIGH)
            state.relay1 = RELAY_OFF
            --send server new state
            pcall(function() ws:send(sjson.encode(createMessage("state-update",state))) end)
        end)
    end


    
    schedule_cron = cron.schedule(state.schedule,createSchedule)
    
    timerReconnect = tmr.create()


    
    wifi.setmode(wifi.STATION, true)
    wifi.sta.autoconnect(1)
    wifi_cfg = {
        ssid  =  "AC_DC",
        pwd  = "1234567890",
        auto = true,
        save = true,   
    }
    wifi.setphymode(wifi.PHYMODE_B)
    wifi.sta.config(wifi_cfg)
    wifi.eventmon.register(wifi.eventmon.STA_CONNECTED,function(connection_info) 
        print("Connected to")
        print_t(connection_info)
    end)
    wifi.eventmon.register(wifi.eventmon.STA_GOT_IP, function(net_info)
        netAvailable = true;
        print("Got IP ")
        print_t(net_info)
       
        ws:connect(url)
        --When Stantion got IP, here should be main logic
    end)
    wifi.eventmon.register(wifi.eventmon.STA_DISCONNECTED,function (disconnection_info) 
        netAvailable = false;
        print("Disconnected from")
        print_t(disconnection_info)
    end)

    wifi.sta.connect()

    ws:on("connection", function(ws)
        timerReconnect:unregister()
        print(pcall(function() ws:send(sjson.encode(createMessage("sync-state",''))) end))

        print('got ws connection')
    end)
    ws:on("receive", function(_, msg, opcode)
        local income = sjson.decode(msg)
        local type = income.type
        local data = income.data
        print_t(income.data) -- opcode is 1 for text message, 2 for binary

        if type == "change-request" then
            pcall(function () print_t(data) end)
            print(data.relay1 or state.relay1)
            
            for k,v in pairs(data) do
                state[k] = v or state[k]
            end
            print_t(state)
            
            gpio.write(1, state.relay1)
            gpio.write(2, state.relay2)
            gpio.write(3, state.relay3)
            gpio.write(4, state.relay4)
            cron.reset()
            cron.schedule(state.schedule,createSchedule)
            print("New schedule setted",state.schedule)
            print(pcall(function() ws:send(sjson.encode(createMessage("state-update",state))) end))
        end
        if type == "sync-time" then
            rtctime.set(data.time,0)
            print('Time synced ',rtctime.get())
        end
        
    end)

    
    ws:on("close", function(_, status)
        print('connection closed', status)
       
        timerReconnect:register(5000, tmr.ALARM_AUTO, function (t) 
            ws:close()
            pcall(function() 
                ws:config({headers={['User-Agent']='NodeMCU'}})
                ws:connect(url) end)
            print("Trying reconnect cause errore code", status)
        end)
        timerReconnect:start()
    end)

    
------------------------------------------
    function print_t(object)
        for k,v in pairs(object) do
            print(k,v)
        end
    end    
    function bool_to_number(value)
        if value == nil then return value end
       return value and 1 or 0
    end

    function createMessage(_type,_data)
        return {type=_type,data=_data}
    end

   end



