organization := "com.cyrildever"
name := "merkle-tree"
version := "1.2.9"
scalaVersion := "2.12.13"

assembly / assemblyMergeStrategy := {
  case PathList("META-INF", _) => MergeStrategy.discard
  case _ => MergeStrategy.first
}
assembly / mainClass := Some("com.cyrildever.merkle.ValidateProof")
assembly / assemblyJarName := s"${name.value}-${version.value}.jar"

credentials += Credentials(Path.userHome / ".ivy2" / ".credentials")

resolvers += "Sonatype Releases" at "https://oss.sonatype.org/content/repositories/releases/"

libraryDependencies ++= Seq(
  "com.github.scopt" %% "scopt" % "4.1.0",
  "org.json4s" %% "json4s-jackson" % "4.0.7",
  "org.scalatest" %% "scalatest" % "3.2.19" % "test",
  "org.scorexfoundation" %% "scrypto" % "3.0.0"
)
