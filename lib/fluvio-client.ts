// This is a simplified mock of a Fluvio client
// In a real implementation, this would use the actual Fluvio SDK

export class FluvioClient {
  private static instance: FluvioClient
  private topics: Map<string, any[]>
  private subscribers: Map<string, Set<(data: any) => void>>

  private constructor() {
    this.topics = new Map()
    this.subscribers = new Map()
  }

  public static getInstance(): FluvioClient {
    if (!FluvioClient.instance) {
      FluvioClient.instance = new FluvioClient()
    }
    return FluvioClient.instance
  }

  // Create a new topic (stream)
  public async createTopic(topicName: string): Promise<void> {
    if (!this.topics.has(topicName)) {
      this.topics.set(topicName, [])
      this.subscribers.set(topicName, new Set())
    }
  }

  // Publish a message to a topic
  public async publish(topicName: string, message: any): Promise<void> {
    if (!this.topics.has(topicName)) {
      await this.createTopic(topicName)
    }

    const messages = this.topics.get(topicName)!
    messages.push(message)

    // Notify subscribers
    const subscribers = this.subscribers.get(topicName)!
    subscribers.forEach((callback) => callback(message))
  }

  // Subscribe to a topic
  public async subscribe(topicName: string, callback: (data: any) => void): Promise<() => void> {
    if (!this.topics.has(topicName)) {
      await this.createTopic(topicName)
    }

    const subscribers = this.subscribers.get(topicName)!
    subscribers.add(callback)

    // Return unsubscribe function
    return () => {
      subscribers.delete(callback)
    }
  }

  // Get all messages from a topic
  public async getMessages(topicName: string): Promise<any[]> {
    if (!this.topics.has(topicName)) {
      return []
    }

    return this.topics.get(topicName)!
  }
}
