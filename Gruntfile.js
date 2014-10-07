module.exports = function (grunt) {

	grunt.initConfig({

		concat: {
			brownie: {
				src: [
					"src/core.js",
					"src/chunk.js",
					"src/aotexture.js",
					"src/raycast.js",
					"src/random.js",
				],
				dest: "build/brownie.js"
			}
		},

		watch: {
			files: "src/*",
			tasks: ["concat:brownie"]
		}

	});


	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask("default", ["concat:brownie"]);

};