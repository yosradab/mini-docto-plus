@REM Maven Wrapper for Windows — https://github.com/apache/maven-wrapper
@echo off
setlocal

set "MAVEN_PROJECTBASEDIR=%~dp0"
if "%MAVEN_PROJECTBASEDIR:~-1%"=="\" set "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%"

set "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"

if not exist "%WRAPPER_JAR%" (
  echo Error: Maven wrapper JAR not found at %WRAPPER_JAR%
  exit /b 1
)

if not defined JAVA_HOME (
  if exist "%LOCALAPPDATA%\Programs\Eclipse Adoptium\jdk-17.0.19.10-hotspot" (
    set "JAVA_HOME=%LOCALAPPDATA%\Programs\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
  )
)
if defined JAVA_HOME (
  set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
) else (
  set "JAVA_EXE=java"
)

"%JAVA_EXE%" ^
  -classpath "%WRAPPER_JAR%" ^
  "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" ^
  org.apache.maven.wrapper.MavenWrapperMain %*

endlocal & exit /b %ERRORLEVEL%
