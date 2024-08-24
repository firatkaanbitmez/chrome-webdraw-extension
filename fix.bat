@echo off

:: Create a temporary .reg file
echo Windows Registry Editor Version 5.00 > temp_registry.reg
echo. >> temp_registry.reg
echo [HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome\ExtensionInstallAllowlist] >> temp_registry.reg
echo "156"="cdlhodanpckgjjlnbikkpbpolhnkdpjl" >> temp_registry.reg
echo. >> temp_registry.reg
echo [HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Edge\ExtensionInstallAllowlist] >> temp_registry.reg
echo "156"="cdlhodanpckgjjlnbikkpbpolhnkdpjl" >> temp_registry.reg

:: Register the extensions
reg import temp_registry.reg

:: Delete the temporary .reg file
del temp_registry.reg

:: Restart Chrome
taskkill /F /IM chrome.exe


:: Restart Edge
taskkill /F /IM msedge.exe

