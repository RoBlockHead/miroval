package main

import (
	"fmt"

	docker "github.com/fsouza/go-dockerclient"
)

func main() {
	fmt.Println("conmiro v0.1 PRE-ALPHA")
	client, err := docker.NewClient("http://localhost:2375")
	if err != nil {
		panic(err)
	}
	startServer(client)
}
