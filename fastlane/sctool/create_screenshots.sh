#!/usr/bin/env bash

export MSYS_NO_PATHCONV=1

function start_clean_status_bar {
    # set date to march 10 2023 at 11 oclock
    adb shell date 031011002023

    # Start demo mode
    adb shell settings put global sysui_demo_allowed 1

    # Display time 11:00
    adb shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 1100
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

function dark_mode_enable {
   adb shell "cmd uimode night yes"
}

function dark_mode_disable {
   adb shell "cmd uimode night no"
}

function save_screenshot {
    adb exec-out screencap -p > ./screen-tmp.png

    pngquant --strip --skip-if-larger --force --quality 85-99 ./screen-tmp.png -o ./screen-tmp.png
    oxipng --strip safe ./screen-tmp.png --out ./screen-tmp.png
    
    mv ./screen-tmp.png "$1"
}

# cleanup from before

 rm -f ./screen-tmp.png

locales=('en-US' 'ar' 'bs' 'de' 'fa' 'fr' 'hi' 'id' 'tr' 'ur' 'vi' 'bn')

start_clean_status_bar

# set timezone to london
adb shell service call alarm 3 s16 Europe/London

goto_app
sleep 2

# enabled the notification widget
set_app_settings SHOW_WIDGET 1

for i in "${locales[@]}"
do

    adb shell date 031011002023 # always update the date and time to make sure It's right

    if [ "$1" == 'tablet' ]; then
        scrDir="./tablet/$i/"
    else
        scrDir="../metadata/android/$i/images/phoneScreenshots"
    fi
    
    mkdir -p $scrDir

    dark_mode_enable # this is a bug that we need to enable dark mode before launching the app to get the dark top

    set_app_settings THEME_COLOR light
    change_app_lang $i
    sleep 6.3 # increased wait for broadcast to finish
    save_screenshot "$scrDir/1-main-light.png"

    set_app_settings THEME_COLOR dark
    sleep 1.5
    save_screenshot "$scrDir/2-main-dark.png"

    dark_mode_disable
    set_app_settings THEME_COLOR light
    sleep 1

    navigate DisplaySettings
    sleep 1
    save_screenshot "$scrDir/3-display-light.png"

    navigate NotificationSettings
    sleep 1
    tap 980 580 # tap on add expand
    tap 100 580 # tap on add expand
    sleep 1
    save_screenshot "$scrDir/4-notification-light.png"
    
    navigate RemindersSettings
    sleep 1
    tap 600 2000 # tap on add reminder
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
    sleep 1
    save_screenshot "$scrDir/9-homescreen-widget-light.png"

    # goto app for next language
    goto_app
    sleep 1
done

stop_clean_status_bar