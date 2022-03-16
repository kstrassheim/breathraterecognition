# Breath-Rate-Recognition (2020)
By using capacitive pressure sensors inside a seat this application is able to retrieve the signal and measure the respiratory rate out of its sinus frequency, by using 3 different algorithms (Discrete Fourier Transformation, Continuous Cut Count, Discrete single period).
A demo of the application with a recorded signal can be viewed at https://breathrate.azurewebsites.net/

## Abstract-Keywords
Respiratory rate, Capacitive sensing, Discrete Fourier Transformation, Web-App, Progressive-Web-App, Real-Time

## Technical-Keywords
.NET Core 3.1, ASP.NET Core, C#, JavaScript, React, SignalR, ChartJS, WebAPI, Azure Web-App, Visual Studio

## User Manual
1. Install the Application like described in Installation Section
2. Open the website on page home (Default)
3. In the menu you can select other algorithms and see their progress. The default algorithm on home page is Continuous Cut Count.
4. By clicking on the Logo you can expand the settings.
	1. In the top line you can select the host of the signal and the port as well as some display settings like display the algorithm as extra labels or see the labels and raw signal.
	2. In the second and third row you can select the buffer sizes and display size (in seconds) but also the noise filter sensity
5. (Optional) For installing on a mobile device to have an app on your smartphone or tablet open the site on this device and click "Add to Home Screen"

## Installation and Development
1. You should download and install Visual Studio Community Edition and DotNetCore 3.1 https://dotnet.microsoft.com/download/dotnet/3.1
2. Clone the git repository
3. Open the BreathRateRecognition.sln file
4. Build and Run the project
