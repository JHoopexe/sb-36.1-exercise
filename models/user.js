/** User class for message.ly */

// const { DB_URI } = require("../config");
// const Message = require("./message");
const jwt = require("jsonwebtoken");
const client = require("../db");
const Message =  require("./message");

/** User of the site. */

class User {
  constructor({username, password, first_name, last_name, phone}){
    this.username = username;
    this.password = password;
    this.first_name = first_name;
    this.last_name = last_name;
    this.phone = phone;
  }
  
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */
  static async register(username, password, first_name, last_name, phone){ 
    const time = new Date();
    const noTimeZone = new Date(time.toISOString().slice(0, -1));
    const results = await client.query(
      `SELECT * 
        FROM users 
        WHERE username = $1`,
      [username]
    );

    const user = results.rows[0];

    if(user === undefined){
      const result2 = await client.query(
        `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING username, password, first_name, last_name, phone`,
          [username, password, first_name, last_name, phone, noTimeZone, time]
      );
  
      return result2.rows[0];
    }
    else{
      const err = new Error(`Username ${username} Is Taken.`);
      err.status = 409;
      throw err;
    }
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password){
    return jwt.verify(username, password);
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username){ 
    const time = new Date();
    const result = await client.query(
      `UPDATE users
        SET last_login_at = $1
        WHERE username = $2`,
        [time, username]
    );
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all(){ 
    const results = await client.query(
      `SELECT username, first_name, last_name, phone
        FROM users`
    );
    return results.rows.map(u => new User(u));
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username){ 
    const results = await client.query(
      `SELECT * 
        FROM users 
        WHERE username = $1`,
      [username]
    );

    const user = results.rows[0];

    if(user === undefined){
      const err = new Error(`Username ${username} Not Found`);
      err.status = 404;
      throw err;
    }
    else{
      return user;
    }
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username){ 
    const result = await client.query(
      `SELECT m.id, 
        m.to_username, 
        m.body, 
        m.sent_at, 
        m.read_at, 
        u.username,
        u.first_name,
        u.last_name,
        u.phone
      FROM messages as m
        JOIN users as u on m.to_username = u.username
      WHERE m.from_username = $1`,
        [username]
    );
    return result.rows[0];
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username){
    const result = await client.query(
      `SELECT m.id, 
        m.from_username, 
        m.body, 
        m.sent_at, 
        m.read_at, 
        u.username,
        u.first_name,
        u.last_name,
        u.phone
      FROM messages as m
        JOIN users as u on m.from_username = u.username
      WHERE m.to_username = $1`,
        [username]
    );
    return result.rows[0];
  }
}

module.exports = User;
