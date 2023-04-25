#!/usr/bin/env bash

export MSYS_NO_PATHCONV=1

function start_clean_status_bar {
    # set date to march 10 2023 at 10 oclock
    adb shell date 031010002023

    # Start demo mode
    adb shell settings put global sysui_demo_allowed 1

    # Display time 10:00
    adb shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 1000
    # Display full mobile data without type
    adb shell am broadcast -a com.android.systemui.demo -e command network -e mobile show -e level 4 -e datatype false
    adb shell am broadcast -a com.android.systemui.demo -e command network -e wifi show -e level 4 -e fully true
    # Hide notifications
    adb shell am broadcast -a com.android.systemui.demo -e command notifications -e visible false
    # Show full battery but not in charging state
    adb shell am broadcast -a com.android.systemui.demo -e command battery -e plugged false -e level 100
}

function stop_clean_status_bar {
    adb shell am broadcast -a com.android.systemui.demo -e command exit
}

function navigate {
    adb shell am broadcast -a com.github.meypod.al_azan.demo -e command navigate -e type push -e screen $@
}

function restart_app {
    adb shell am broadcast -a com.github.meypod.al_azan.demo -e command restart
}

function set_app_settings {
    adb shell am broadcast -a com.github.meypod.al_azan.demo -e command set -e store settings -e key $1 -e value $2
}

function change_app_lang {
    adb shell am broadcast -a com.github.meypod.al_azan.demo -e command lang -e lang $1
}

function tap {
    adb shell input tap $1 $2
}

function expand_status_bar {
    adb shell service call statusbar 1
}

function collapse_status_bar {
    adb shell service call statusbar 2
}

function goto_home {
    adb shell input keyevent KEYCODE_HOME
}

function goto_app {
    adb shell am start com.github.meypod.al_azan/.MainActivity
}

function save_screenshot {
    #Capture a screenshot and save to /sdcard/screen.png on your Android device.
    adb shell screencap -p /sdcard/screen.png
    #Grab the screenshot from /sdcard/screen.png to /tmp/screen.png on your PC.
    adb pull /sdcard/screen.png ./screen-tmp.png
    #Delete /sdcard/screen.png
    adb shell rm /sdcard/screen.png
    
    mv ./screen-tmp.png "$1"
}

locales=('en-US' 'fa' 'bs' 'de' 'fr' 'vi' 'tr')

start_clean_status_bar

goto_app
sleep 2

# enabled the notification widget
set_app_settings SHOW_WIDGET 1

for i in "${locales[@]}"
do
    scrDir="../metadata/android/$i/images/phoneScreenshots"
    mkdir -p $scrDir

    set_app_settings THEME_COLOR light
    change_app_lang $i
    sleep 2
    save_screenshot "$scrDir/1-main-light.png"

    set_app_settings THEME_COLOR dark
    sleep 0.5
    save_screenshot "$scrDir/2-main-dark.png"

    set_app_settings THEME_COLOR light

    navigate DisplaySettings
    sleep 1
    save_screenshot "$scrDir/3-display-light.png"

    navigate NotificationSettings
    sleep 1
    tap 980 610 # tap on add expand
    sleep 1
    save_screenshot "$scrDir/4-notification-light.png"
    
    navigate RemindersSettings
    sleep 1
    tap 600 2100 # tap on add reminder
    sleep 0.5
    save_screenshot "$scrDir/5-reminders-light.png"

    navigate QadaCounter
    sleep 1
    save_screenshot "$scrDir/6-qada-counter-light.png"

    navigate QiblaCompass -e skipInit 1
    sleep 1
    save_screenshot "$scrDir/7-qibla-compass-light.png"

    # widgets
    expand_status_bar
    sleep 0.5
    save_screenshot "$scrDir/8-notification-widget-light.png"
    collapse_status_bar
    goto_home
    sleep 0.5
    save_screenshot "$scrDir/9-homescreen-widget-light.png"

    # goto app for next language
    goto_app
    sleep 1
done

stop_clean_status_bar