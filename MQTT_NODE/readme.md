net stop mosquitto

net start mosquitto
sc query mosquitto
netstat -ano | findstr 1883

mờ port 1883 cho tường lửa
C:\Program Files\mosquitto\mosquitto.conf và đảm bảo có ít nhất 2 dòng sau:
conf
listener 1883 0.0.0.0
allow_anonymous true