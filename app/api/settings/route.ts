import { authenticateRequest } from '@/lib/auth'
import { db } from '@/lib/db'
import { emitToPosUsers } from '@/lib/socketEmitter'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Get settings (create default if doesn't exist)
    let settings = await db.settings.findFirst()
    
    if (!settings) {
      settings = await db.settings.create({
        data: {} // Will use default values from schema
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request)
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const data = await request.json()
    console.log('Received settings data:', data)

    // Get or create settings
    let settings = await db.settings.findFirst()
    
    if (!settings) {
      console.log('Creating new settings with data:', data)
      settings = await db.settings.create({
        data: data
      })
    } else {
      console.log('Updating existing settings with data:', data)
      settings = await db.settings.update({
        where: { id: settings.id },
        data: data
      })
    }

    console.log('Settings saved successfully:', settings)

    // Emit real-time event for settings update
    emitToPosUsers('settingsUpdated', settings)

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('Error saving settings:', error)
    console.error('Error details:', error.message)
    console.error('Stack trace:', error.stack)
    return NextResponse.json({ 
      error: 'Failed to save settings',
      details: error.message 
    }, { status: 500 })
  }
} 