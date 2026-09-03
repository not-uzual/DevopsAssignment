# Git/GitHub Assignment

> ###  Task 1

```bash
git commit -a -m "Comment"
```

- -m creates a commit from whatever is currently in the staging area.
- -a Automatically stage modified and deleted tracked files before committing.

> ### Task 2
```bash
git cherry-pick b31e82f
```
**Cherry-pick copies the changes of a specific commit onto your current branch. It does not merge the entire branch.**

```bash
#!/bin/bash

mkdir git-practice
cd git-practice
git init

echo "Hello" > file.txt
git add file.txt
git commit -m "Initial commit"

echo "Line 2" >> file.txt
git commit -a -m "Add line 2"

echo "Line 3" >> file.txt
git commit -a -m "Add line 3"

echo "Main feature" > main.txt
git add main.txt
git commit -m "Add main feature"

git log --oneline

git switch -c feature

echo "Feature 1" > feature.txt
git add feature.txt
git commit -m "Feature commit 1"

echo "Feature 2" >> feature.txt
git add feature.txt
git commit -m "Feature commit 2"

echo "Feature 3" >> feature.txt
git add feature.txt
git commit -m "Feature commit 3"

git log --oneline

git switch main

git log --oneline --graph --all

git cherry-pick <FEATURE_COMMIT_HASH>

git log --oneline --graph --all

cat feature.txt
```
