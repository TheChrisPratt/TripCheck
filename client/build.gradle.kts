import com.github.gradle.node.npm.task.NpmTask

plugins {
  id("com.github.node-gradle.node") version "7.1.0"
  base
}

node {
  version.set("20.11.0")
  npmVersion.set("10.2.4")
  download.set(true)
}

tasks.npmInstall {
  onlyIf { !file("node_modules").exists() }
  inputs.file("package.json")
  outputs.dir("node_modules")
}

val npmBuild = tasks.register<NpmTask>("npmBuild") {
  dependsOn(tasks.npmInstall)
  args.set(listOf("run", "build"))
  inputs.dir("src")
  inputs.file("package.json")
  inputs.file("angular.json")
  outputs.dir("dist")
}

val npmTest = tasks.register<NpmTask>("test") {
  dependsOn(tasks.npmInstall)
  args.set(listOf("run", "test"))
  inputs.dir("src")
  inputs.file("package.json")
  inputs.file("angular.json")
  inputs.file("tsconfig.spec.json")
}

tasks.named("check") {
  dependsOn(npmTest)
}

tasks.build {
  dependsOn(npmBuild)
}
