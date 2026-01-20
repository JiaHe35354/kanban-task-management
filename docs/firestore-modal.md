# Firestore Data Modal

## users

- id (uid from Firebase Auth)
- email
- createAt

## boards

- id
- name
- userId
- createAt

## columns

- id
- boardId
- name
- color
- order

## tasks

- id
- boardId
- columnId
- title
- description
- order

## subtasks

- id
- taskId
- title
- isCompleted
- order
