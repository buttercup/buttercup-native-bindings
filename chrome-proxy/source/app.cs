using System;
using Buttercup.Proxy;

class Program {

	static void Main(string[] args) {
		RequestHandler handler = new RequestHandler();
		Server bps = new Server(handler.handleRequest, "http://localhost:56376/proxy/");
		bps.run();
		Console.WriteLine("Proxy online. Press a key to quit.");
        Console.ReadKey();
        bps.stop();
	}

}