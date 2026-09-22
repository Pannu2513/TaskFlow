const express = require("express");
const cors = require("cors");
const db = require("./db");
const app = express();
app.use(cors());
app.use(express.json());
const tasks = [
    {
        id: 1,
        name: "Complete DSA assignment",
        deadline: "2026-09-25",
        completed: false
    },
    {
        id: 2,
        name: "Prepare project review",
        deadline: "2026-09-28",
        completed: false
    }
];

app.get("/", function (req, res) {
    res.send("TaskFlow Backend is running!");
});

app.get("/api/tasks", function (req, res) {

    db.query("SELECT * FROM tasks", function(error, results) {

        if (error) {
            return res.status(500).json({
                message: "Database error"
            });
        }

        const formattedTasks = results.map(function(task) {
            return {
                id: task.id,
                name: task.name,
                deadline: task.deadline,
                completed: Boolean(task.completed)
            };
        });

        res.json(formattedTasks);
    });

});
app.put("/api/tasks/:id", function (req, res) {

    const taskId = Number(req.params.id);

    db.query(
        "SELECT * FROM tasks WHERE id = ?",
        [taskId],
        function(error, results) {

            if (error) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Task not found"
                });
            }

            const task = results[0];

            const name = req.body.name !== undefined
                ? req.body.name
                : task.name;

            const deadline = req.body.deadline !== undefined
                ? req.body.deadline
                : task.deadline;

            const completed = req.body.completed !== undefined
                ? req.body.completed
                : Boolean(task.completed);

            const sql = `
                UPDATE tasks
                SET name = ?, deadline = ?, completed = ?
                WHERE id = ?
            `;

            db.query(
                sql,
                [name, deadline, completed, taskId],
                function(error) {

                    if (error) {
                        return res.status(500).json({
                            message: "Database error"
                        });
                    }

                    res.json({
                        id: taskId,
                        name: name,
                        deadline: deadline,
                        completed: Boolean(completed)
                    });

                }
            );

        }
    );

});
app.delete("/api/tasks/:id", function (req, res) {

    const taskId = Number(req.params.id);

    db.query(
        "DELETE FROM tasks WHERE id = ?",
        [taskId],
        function(error, result) {

            if (error) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Task not found"
                });
            }

            res.json({
                message: "Task deleted successfully"
            });

        }
    );

});
app.post("/api/tasks", function (req, res) {

    const name = req.body.name;
    const deadline = req.body.deadline;

    const sql = `
        INSERT INTO tasks (name, deadline, completed)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [name, deadline, false], function(error, result) {

        if (error) {
            return res.status(500).json({
                message: "Database error"
            });
        }

        const newTask = {
            id: result.insertId,
            name: name,
            deadline: deadline,
            completed: false
        };

        res.json(newTask);
    });

});

app.listen(3000, function () {
    console.log("Server running on http://localhost:3000");
});