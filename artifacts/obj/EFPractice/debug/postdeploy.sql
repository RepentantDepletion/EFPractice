INSERT INTO TASKS (ID, TITLE, DESCRIPTION, DEADLINE, LISTID, DONE, PRIORITY)
VALUES (1, 'Make a todo list 📃', 'Create a todo list to keep track of my tasks', NULL, 1, FALSE, 'Medium'),
       (2, 'Buy groceries 🛒', 'Milk, Bread, Eggs, Cheese', '2024-07-01 18:00:00', 1, FALSE, 'High'),
       (3, 'Go for a run 🏃‍♂️', 'Run 5 kilometers in the park', '2024-07-02 07:00:00', 1, FALSE, 'Low'),
       (4, 'Read a book 📚', 'Read "The Great Gatsby" by F. Scott Fitzgerald', '2024-07-03 20:00:00', 1, FALSE, 'Medium'),
       (5, 'Call Mom 📞', 'Check in with Mom and see how she is doing', '2024-07-01 19:00:00', 1, FALSE, 'High'),
       (6, 'Clean the house 🧹', 'Vacuum, dust, and mop the floors', '2024-07-04 10:00:00', 1, FALSE, 'Low'),
       (7, 'Finish project report 📊', 'Complete the final report for the project and submit it to the manager', '2024-07-05 17:00:00', 1, FALSE, 'High'),
       (8, 'Plan weekend trip 🏖️', 'Research and plan a weekend trip to the beach with friends', '2024-07-06 12:00:00', 1, FALSE, 'Medium'),
       (9, 'Attend yoga class 🧘‍♀️', 'Go to the local gym for a yoga class to relax and unwind', '2024-07-07 18:00:00', 1, FALSE, 'Low');

GO

INSERT INTO TASKLISTS (ID, TITLE)
VALUES (1, 'Tasks'),
        (2, 'Work'),
        (3, 'Personal'),
        (4, 'Shopping'),
        (5, 'Fitness');
GO
