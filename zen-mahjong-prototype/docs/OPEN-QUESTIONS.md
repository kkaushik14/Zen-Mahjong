# Open questions

These questions do not block the repository foundation. They block final gameplay behavior.

Milestone 3 uses the provisional answers recorded in `ASM-011`; none of those implementations closes these questions.

1. Which exact tile families match, including flower and season rules?
2. What geometric conditions make a tile available?
3. Are generated layouts guaranteed solvable, and may Shuffle change tile positions or identities?
4. Are Undo, Hint, and Shuffle unlimited, earned, or level-specific?
5. What happens when no legal pair remains?
6. How are score, stars, time, moves, and level completion calculated?
7. What events advance streaks, and how are calendar/time-zone boundaries handled?
8. Which achievements exist, and may progress be hidden?
9. Can multiple local profiles exist on one device?
10. Is audio required for `v0.2.0`, and what are the default sound and music settings?
11. Which board layouts and level content belong in the first playable milestone?
12. Are tablets a supported layout target for the prototype?
13. What are the exact Undo, Hint, and Shuffle limits for each difficulty or level type?
14. How are limited actions earned, purchased, restored, and handled when offline?
15. Which rewards exist, and which rewards must be server-authoritative?
16. Is Offline Play an anonymous profile, a guest profile eligible for later import, or permanently separate from account progress?
17. When local and account histories conflict, may one replace the other, can they be combined, or must the player choose?
18. Which account and authentication methods are required?
19. Which server features are required for the first enhanced release: sync, remote content, daily challenges, events, leaderboards, or all of these?
20. Which backend hosting, API framework, document database, observability, and backup services are acceptable?
21. What is the target maximum board size and minimum supported device performance class?
22. Which Zen objects, sounds, haptics, and environmental themes are approved for level completion?
23. Are quotes part of the experience, and if so, who reviews attribution and cultural accuracy?
24. What are the accepted frame-time, launch-time, memory, battery, and server-latency thresholds?
25. What data retention, account deletion, privacy, and regional compliance requirements apply?
26. How many included Identity/Super Concentration uses does Special Relaxation provide?
27. Are score-funded revives allowed after the second use in one game, and if so, what is the price or limit?
28. What precedence applies when multiple Zen Score conditions overlap?
29. What completion-time baseline and direction map 10-second intervals to the no-assist integer score from 18 through 20?
30. What do Zen progress milestones 3, 6, 10, and 20 measure, and when do they reset or carry over?
31. How are the four gameplay categories distributed across an eight-level tier, and how is fractional Concentration Score rounded?
32. What algorithm returns four blocked tray tiles to valid board positions while preserving solvability and Undo semantics?
33. Does an existing two-selection active session migrate into the Concentration system, finish under legacy rules, or restart with explicit consent?
34. Have all 21 reported Concentration design frames been visually verified and exported from the production Figma file?
