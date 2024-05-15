import "colors";

/**
 * Returns the current date an time in a string.
 * @returns {string}
 */
function timeStringNow(): string {
	const now = new Date();
	return `${now.getUTCDate().toString().padStart(2, "0")}-${(now.getUTCMonth() + 1).toString().padStart(2, "0")}-${now.getUTCFullYear().toString().padStart(4, "0")} ${now.getUTCHours().toString().padStart(2, "0")}:${now.getUTCMinutes().toString().padStart(2, "0")}:${now.getUTCSeconds().toString().padStart(2, "0")}:${now.getUTCMilliseconds().toString().padStart(3, "0")}`;
}

/**
 * The severity of a log entry.
 * @enum {number}
 */
enum LogLevel {
	/** An unexpected circumstance. */
	Error = 0,
	/** An expected but negative circumstance. */
	Warning = 1,
	/** Important information. */
	Info = 2,
	/** Used for debugging code and logging a value. Unimportant information. */
	Debug = 3,
}

const Log = {
	/**
	 * Make a debug log entry.
	 * @param {string} message The message to include.
	 * @returns {void}
	 */
	debug(message: any): void {
		rawLog(LogLevel.Debug, message);
	},

	/**
	 * Make a info log entry.
	 * @param {string} message The message to include.
	 * @returns {void}
	 */
	info(message: any): void {
		rawLog(LogLevel.Info, message);
	},

	/**
	 * Make a warning log entry.
	 * @param {string} message The message to include.
	 * @returns {void}
	 */
	warn(message: any): void {
		rawLog(LogLevel.Warning, message);
	},

	/**
	 * Make a error log entry.
	 * @param {string} message The message to include.
	 * @returns {void}
	 */
	error(message: any): void {
		rawLog(LogLevel.Error, message);
	},
};

/**
 * Makes a log entry.
 * @param {LogLevel} level The severity of the entry.
 * @param {string} message The message to include.
 * @returns {Promise<void>}
 */
function rawLog(level: number, message: string): void {

	var levelString: string;
	switch (level) {
		case 0: levelString = `[ERROR]`.red; break;
		case 1: levelString = `[WARNING]`.yellow; break;
		case 2: levelString = `[INFO]`.magenta; break;
		case 3: levelString = `[DEBUG]`.blue; break;
		default: levelString = ``;
	}

	message = `${timeStringNow()} | ${levelString.padEnd(9)} | ${message}`;
	console.log(message);

}

export { Log, LogLevel, rawLog, timeStringNow };