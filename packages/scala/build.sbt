organization := "com.cyrildever"
name := "merkle-tree"
version := "1.1.0"
scalaVersion := "2.12.13"

assemblyMergeStrategy in assembly := {
  case PathList("META-INF", _) => MergeStrategy.discard
  case _ => MergeStrategy.first
}
mainClass in assembly := Some("com.cyrildever.merkle.ValidateProof")
assemblyJarName in assembly := s"${name.value}-${version.value}.jar"

credentials += Credentials(Path.userHome / ".ivy2" / ".credentials")

resolvers += "Sonatype Releases" at "https://oss.sonatype.org/content/repositories/releases/"

libraryDependencies ++= Seq(
  "com.github.scopt" %% "scopt" % "4.1.0",
  "org.json4s" %% "json4s-jackson" % "4.0.6",
  "org.scalatest" %% "scalatest" % "3.2.14",
  "org.scorexfoundation" %% "scrypto" % "2.2.1"
)
