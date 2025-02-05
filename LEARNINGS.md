### if there is missing deps in your project, and this error occurs; 
- use this package:<br> 
    ```
    npm install -g depcheck
    ```
- then run `depcheck` and gg. you will know themissing deps that your files have 'required' but not installed. 

- https://stackoverflow.com/questions/348170/how-do-i-undo-git-add-before-commit

- accidental push to public, to revert: 
    ```git
    git reset HEAD
    git push -f 
    ```
- https://stackoverflow.com/questions/11928013/node-env-is-not-recognized-as-an-internal-or-external-command-operable-comman

- for this error: 
   ```javascript
   MongooseServerSelectionError: connect ECONNREFUSED ::1:27017
    at _handleConnectionErrors (C:\Users\srihari\Dropbox\tour-management-system\node_modules\mongoose\lib\connection.js:1110:11)
    at NativeConnection.openUri (C:\Users\srihari\Dropbox\tour-management-system\node_modules\mongoose\lib\connection.js:1041:11)
    at async connectToDatabase (C:\Users\srihari\Dropbox\tour-management-system\server.js:12:3) {
  reason: TopologyDescription {
    type: 'Unknown',
    servers: Map(1) { 'localhost:27017' => [ServerDescription] },
    stale: false,
    compatible: true,
    heartbeatFrequencyMS: 10000,
    localThresholdMS: 15,
    setName: null,
    maxElectionId: null,
    maxSetVersion: null,
    commonWireVersion: 0,
    logicalSessionTimeoutMinutes: null
  },
  code: undefined } 

```
**solution**: https://stackoverflow.com/questions/69840504/mongooseserverselectionerror-connect-econnrefused-127017 
tl;dr-> the fix was in .env file. CHANGE DATABASE url from mongodb://`localhost`:27017/<db_name> to mongodb://`127.0.0.1`:27017/<db_name> 