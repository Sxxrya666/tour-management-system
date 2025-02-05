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