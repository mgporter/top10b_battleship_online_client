# Welcome to Battleship Online, a Player vs Player client for the Battleship game! 

## To see a live preview, go to [https://mgporter.github.io/top10b_battleship_online_client/](https://mgporter.github.io/top10b_battleship_online_client/). Happy playing!

---

## Project details: Client
# View sourcecode at [https://github.com/mgporter/top10b_battleship_online](https://github.com/mgporter/top10b_battleship_online).

- The client provides important feedback to players on the progress and actions of the opponent player. For example, if the player has to wait on their opponent, clear feedback is given on what they are waiting for and the progress of the opponent.
- The client has the ability to load up a game that was started and not completed. As long as one person remains in a gameroom, that room will not be deleted and is accessible by anyone.
- I rewrote the whole codebase from Vanilla JS to React, improving many things on the way. The app utilizes state updates with useState, useContext, and useReducer, and makes more efficient use of useEffect through useMemo and useCallback. Also includes several of my custom hooks for API interaction and to group functionality.
- Uses WebSockets (through SockJS and Stomp) to connect to the server backend.
- Uses a custom eventemitter to better manage events within React.
- Much better separation of responsibility than the origin version. Code is cleaner and more maintainable.


## Project details: Server
# View sourcecode at [https://github.com/mgporter/top10b_battleship_online_client](https://github.com/mgporter/top10b_battleship_online_client).

- Utilizes a Java Spring Boot backend, which uses Spring Data with MongoDB.
- Although I didn't use Spring Security for this one, I did create a custom handshake handler for websockets to create a Principal object that persists throughout the session and which carries important information about the user's path through the program.
- For the sake of efficiently, the server saves data from players only at key points (rather than, for example, after every single attack).
- Again for efficiency, the server saves only the minimal game state needed to recreate an already started game. Only upon loading the game state are the necessary objects and auxiliary data created (which are necessary for actually playing the game).
- Although the client checks for valid input, attacks, placements, etc.., the server also verifies that all data it receives is valid for the game context, and performs the game actual calculations itself (for example: 'what was the result of the last attack?') to prevent cheating. Although it would be easier to send the opponent's data to the client and just have the client do everything, we cannot do that because players might be able to access that data. Instead, the server is careful to only send back the information that the player is allowed to know at each point in the game.