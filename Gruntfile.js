module.exports = function (grunt) {

	grunt.initConfig({

		concat: {
			brownie: {
				src: [
					"src/core.js",
					"src/geometry-manager.js",
					"src/quad-manager.js",
					"src/voxel-manager.js",
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