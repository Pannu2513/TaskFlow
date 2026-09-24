const express = require("express");
const cors = require("cors");
const db = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
function verifyToken(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Access denied. No token provided."
        });
    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired token"
        });

    }
}
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

app.get("/api/tasks", verifyToken, function (req, res) {
const userId = req.user.userId;
    db.query(
    "SELECT * FROM tasks WHERE user_id = ?",
    [userId],
    function(error, results)  {

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
 app.put("/api/tasks/:id", verifyToken, function (req, res) {
const userId = req.user.userId;
    const taskId = Number(req.params.id);

    db.query(
    "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
    [taskId, userId],
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
    WHERE id = ? AND user_id = ?
`;

            db.query(
                sql,
                [name, deadline, completed, taskId,userId],
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
app.delete("/api/tasks/:id",verifyToken, function (req, res) {

    const taskId = Number(req.params.id);
const userId = req.user.userId;
   db.query(
    "DELETE FROM tasks WHERE id = ? AND user_id = ?",
    [taskId, userId],
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
 app.post("/api/tasks", verifyToken, function (req, res) {

    const name = req.body.name;
    const deadline = req.body.deadline;
    const userId = req.user.userId;

    
       const sql = `
    INSERT INTO tasks (name, deadline, completed, user_id)
    VALUES (?, ?, ?, ?)
`;
    

    db.query(sql, [name, deadline, false,userId], function(error, result) {

        if (error) {
            return res.status(500).json({
                message: "Database error"
            });
        }

        const newTask = {
            id: result.insertId,
            name: name,
            deadline: deadline,
            completed: false,
               userId: userId
        };

        res.json(newTask);
    });

});
app.post("/api/signup", async function(req, res) {

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
        `;

        db.query(
            sql,
            [name, email, hashedPassword],
            function(error, result) {

                if (error) {

                    if (error.code === "ER_DUP_ENTRY") {
                        return res.status(400).json({
                            message: "Email already exists"
                        });
                    }

                    return res.status(500).json({
                        message: "Database error"
                    });
                }

                res.status(201).json({
                    message: "User registered successfully",
                    userId: result.insertId
                });

            }
        );

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });

    }

});
app.post("/api/login", async function(req, res) {

    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async function(error, results) {

            if (error) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (results.length === 0) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            const user = results[0];

            const passwordMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!passwordMatch) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            const token = jwt.sign(
    {
        userId: user.id,
        email: user.email
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "1h"
    }
);

res.json({
    message: "Login successful",
    token: token,
    userId: user.id,
    name: user.name,
    email: user.email
});

        }
    );

});

app.listen(3000, function () {
    console.log("Server running on http://localhost:3000");
});