# 🌍 AtmosReal – Planetary Weather Intelligence

**Version:** 0.2.0
**Status:** Under development  
**Developer:** Israel Garcia Real
**Course:** Web Development 1 – Front End  
**Institution:** Laurea University of Applied Sciences  
**Assignment:** Project 3 – JavaScript Application Using External Libraries

## Project Overview

AtmosReal is an interactive weather application featuring a rotating
3D Earth inspired by the view from the Moon.

The idea is to allow users to explore the planet, select geographical
locations and access weather forecasts through an interactive and
responsive interface.

The visual concept combines a cybernetic design with realistic
planetary colors, atmospheric effects and dynamic themes based on
day, night and weather conditions.

## Planned Features

- Interactive rotating 3D Earth
- Manual rotation and zoom
- Geographical location selection
- City search
- Current weather information
- Five-day weather forecast
- Interactive forecast charts
- Dynamic day and night themes
- Weather-dependent visual effects
- Responsive desktop and mobile layouts

## Planned Technologies

| Technology     | Purpose                           |
| -------------- | --------------------------------- |
| HTML5          | Application structure             |
| CSS3           | Custom styling                    |
| JavaScript     | Application logic                 |
| Tailwind CSS   | Responsive user interface         |
| jQuery         | Events, AJAX and DOM manipulation |
| Globe.gl       | Interactive 3D Earth              |
| Three.js       | 3D graphics                       |
| Open-Meteo     | Weather forecast API              |
| Apache ECharts | Data visualization                |
| Vite           | Development and build environment |
| GitHub Pages   | Application deployment            |

## Initial Wireframes

The initial wireframes are stored in the `docs/wireframes/` directory.

They represent the original concept for the landing page,
weather dashboard and mobile interface.

The final visual design may evolve during development.

## Development History

### Version 0.2.0 – Interactive 3D Earth

- Implemented an interactive 3D Earth using Globe.gl and Three.js.
- Added automatic rotation, manual navigation and zoom controls.
- Implemented geographical selection with pulsating location markers.
- Created a Moon-inspired observation environment.
- Implemented solar illumination based on the current UTC time.
- Added nighttime city lights and decorative cloud formations.
- Developed custom GLSL shaders and color-space management.
- Added real-time and exploration observation modes.
- Implemented responsive camera positioning.
- Optimized portrait and landscape layouts using CSS media queries.
- Tested responsive layouts using Chrome DevTools.
- Successfully built and tested the production application using Vite.

### Version 0.1.0 – Initial Plan and Wireframe

- Established the project concept and identity.
- Created initial wireframes.
- Initialized the local development environment.
- Installed Vite and Tailwind CSS.
- Created the GitHub repository.
- Added the MIT License.

## External Resources and Technical References

- Globe.gl: https://globe.gl/
- Globe.gl day/night example:
  https://globe.gl/example/day-night-cycle/
- Globe.gl cloud example:
  https://globe.gl/example/clouds/
- Three.js: https://threejs.org/
- Three.js color management:
  https://threejs.org/manual/pages/color-management.html
- Tailwind CSS: https://tailwindcss.com/
- jQuery: https://jquery.com/
- Vite: https://vite.dev/
- Solar Calculator:
  https://www.npmjs.com/package/solar-calculator

The Earth, nighttime lights, clouds and starfield textures
are sourced from Globe.gl and Three-globe example assets.

The lunar foreground is AI-generated artwork.

The solar illumination is an approximation based on the
current date and time. Cloud formations are decorative
and do not represent live meteorological conditions.

Third-party assets remain subject to their respective
licenses and usage conditions.

## AI Usage and Original Concept

The original concept, creative direction, application name
and project objectives of AtmosReal were conceived by
the developer, Israel Garcia Real.

ChatGPT has been used as a technical and educational
assistant throughout the development process, supporting:

- Technical guidance and library selection.
- Translation of the original concept into wireframes.
- Code examples and implementation guidance.
- Generation of the lunar foreground artwork.
- GLSL shader development and troubleshooting.
- Responsive layout improvements.
- Debugging and problem-solving.
- Technical documentation and code explanations.

All implementations have been progressively reviewed,
tested and evaluated by the developer.

Design decisions, feature selection and the overall
creative direction remain the responsibility of the
developer.

AI assistance has also served as a learning resource
for understanding new technologies, programming
concepts and development practices.

## License

This project is licensed under the MIT License.
See the LICENSE file for details.

© 2026 Israel Garcia Real
